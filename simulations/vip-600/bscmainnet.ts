import { expect } from "chai";
import { BigNumber, Contract, Signer, Wallet } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { SWAP_HELPER, SWAP_ROUTER, UNITROLLER, vip600 } from "../../vips/vip-600/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import SWAP_HELPER_ABI from "./abi/SwapHelper.json";
import SWAP_ROUTER_ABI from "./abi/SwapRouter.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// =============================================================================
// Constants
// =============================================================================

const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const vUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const vBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const USDT_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";
const USDC_HOLDER = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";

const NATIVE_TOKEN_ADDR = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const FORK_BLOCK = 76556273;

// PancakeSwap V2 Router on BSC
const PANCAKE_V2_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const PANCAKE_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
];

// =============================================================================
// EIP-712 Swap Signer
// =============================================================================

let swapSignerWallet: Wallet;
let swapHelperContract: Contract;
let eip712Domain: { name: string; version: string; chainId: number; verifyingContract: string };
let saltCounter = 0;

async function setupSwapSigner() {
  swapSignerWallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", ethers.provider);

  swapHelperContract = new ethers.Contract(SWAP_HELPER, SWAP_HELPER_ABI, ethers.provider);

  const swapHelperOwner = await swapHelperContract.owner();
  const impersonatedOwner = await initMainnetUser(swapHelperOwner, ethers.utils.parseEther("1"));
  await swapHelperContract.connect(impersonatedOwner).setBackendSigner(swapSignerWallet.address);

  const [domain, network] = await Promise.all([swapHelperContract.eip712Domain(), ethers.provider.getNetwork()]);
  eip712Domain = {
    name: domain.name,
    version: domain.version,
    chainId: network.chainId,
    verifyingContract: domain.verifyingContract,
  };
}

// =============================================================================
// Swap Calldata Builders (API-first with PancakeSwap V2 fallback)
// =============================================================================

/**
 * Tries the Venus swap API first (5s timeout), falls back to PancakeSwap V2 on-chain.
 */
async function buildSwapCalldata(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  recipient: string,
  slippageBps: number = 100,
): Promise<{ swapData: string; minAmountOut: BigNumber; amountOut: BigNumber }> {
  try {
    const result = await buildSwapCalldataFromAPI(tokenIn, tokenOut, amountIn, recipient);
    return { ...result, amountOut: result.minAmountOut };
  } catch (apiError) {
    console.log(
      `    Swap API unavailable (${
        apiError instanceof Error ? apiError.message : apiError
      }), falling back to PancakeSwap V2`,
    );
  }
  return buildSwapCalldataFromPancakeV2(tokenIn, tokenOut, amountIn, recipient, slippageBps);
}

async function buildSwapCalldataFromAPI(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  recipient: string,
): Promise<{ swapData: string; minAmountOut: BigNumber }> {
  const TEN_YEARS_SECS = 10 * 365 * 24 * 60 * 60;
  const deadline = Math.floor(Date.now() / 1000) + TEN_YEARS_SECS;
  const actualTokenIn = tokenIn.toLowerCase() === NATIVE_TOKEN_ADDR.toLowerCase() ? WBNB : tokenIn;

  const params = new URLSearchParams({
    chainId: "56",
    tokenInAddress: actualTokenIn,
    tokenOutAddress: tokenOut,
    slippagePercentage: "0.5",
    recipientAddress: SWAP_HELPER,
    deadlineTimestampSecs: deadline.toString(),
    type: "exact-in",
    shouldTransferToReceiver: "false",
    exactAmountInMantissa: amountIn.toString(),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`https://api.venus.io/find-swap?${params}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`Swap API error: ${res.status}`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json = (await res.json()) as any;
    if (!json.quotes?.length) throw new Error(`No API route found for ${tokenIn} -> ${tokenOut}`);

    const quote = json.quotes[0];
    const swapHelperIface = new ethers.utils.Interface(SWAP_HELPER_ABI);
    const calls: string[] = [];

    for (const tx of quote.txs) {
      calls.push(swapHelperIface.encodeFunctionData("approveMax", [actualTokenIn, tx.target]));
      calls.push(swapHelperIface.encodeFunctionData("genericCall", [tx.target, tx.data]));
    }
    calls.push(swapHelperIface.encodeFunctionData("sweep", [tokenOut, recipient]));

    const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256"], [++saltCounter]));
    const types = {
      Multicall: [
        { name: "caller", type: "address" },
        { name: "calls", type: "bytes[]" },
        { name: "deadline", type: "uint256" },
        { name: "salt", type: "bytes32" },
      ],
    };
    const value = { caller: SWAP_ROUTER, calls, deadline, salt };
    const signature = await swapSignerWallet._signTypedData(eip712Domain, types, value);
    const multicallData = swapHelperIface.encodeFunctionData("multicall", [calls, deadline, salt, signature]);

    return { swapData: multicallData, minAmountOut: BigNumber.from(1) };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function buildSwapCalldataFromPancakeV2(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  recipient: string,
  slippageBps: number,
): Promise<{ swapData: string; minAmountOut: BigNumber; amountOut: BigNumber }> {
  const pancakeRouter = new ethers.Contract(PANCAKE_V2_ROUTER, PANCAKE_V2_ROUTER_ABI, ethers.provider);
  const actualTokenIn = tokenIn.toLowerCase() === NATIVE_TOKEN_ADDR.toLowerCase() ? WBNB : tokenIn;

  let path: string[];
  let amounts: BigNumber[];

  try {
    path = [actualTokenIn, tokenOut];
    amounts = await pancakeRouter.getAmountsOut(amountIn, path);
  } catch {
    if (actualTokenIn !== WBNB && tokenOut !== WBNB) {
      path = [actualTokenIn, WBNB, tokenOut];
      amounts = await pancakeRouter.getAmountsOut(amountIn, path);
    } else {
      throw new Error(`No route found for ${tokenIn} -> ${tokenOut}`);
    }
  }

  const amountOut = amounts[amounts.length - 1];
  const minAmountOut = amountOut.mul(10000 - slippageBps).div(10000);

  const swapHelperIface = new ethers.utils.Interface(SWAP_HELPER_ABI);
  const pancakeIface = new ethers.utils.Interface(PANCAKE_V2_ROUTER_ABI);
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  const calls = [
    swapHelperIface.encodeFunctionData("approveMax", [actualTokenIn, PANCAKE_V2_ROUTER]),
    swapHelperIface.encodeFunctionData("genericCall", [
      PANCAKE_V2_ROUTER,
      pancakeIface.encodeFunctionData("swapExactTokensForTokens", [
        amountIn,
        minAmountOut,
        path,
        SWAP_HELPER,
        deadline,
      ]),
    ]),
    swapHelperIface.encodeFunctionData("sweep", [tokenOut, recipient]),
  ];

  const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256"], [++saltCounter]));
  const types = {
    Multicall: [
      { name: "caller", type: "address" },
      { name: "calls", type: "bytes[]" },
      { name: "deadline", type: "uint256" },
      { name: "salt", type: "bytes32" },
    ],
  };
  const value = { caller: SWAP_ROUTER, calls, deadline, salt };
  const signature = await swapSignerWallet._signTypedData(eip712Domain, types, value);
  const multicallData = swapHelperIface.encodeFunctionData("multicall", [calls, deadline, salt, signature]);

  return { swapData: multicallData, minAmountOut, amountOut };
}

// =============================================================================
// Swap Data Wrappers
// =============================================================================

async function getSwapData(
  tokenInAddress: string,
  tokenOutAddress: string,
  exactAmountInMantissa: string,
  recipientAddress: string,
  slippagePercentage: string = "0.01",
): Promise<{ swapData: string; minAmountOut: BigNumber; amountOut: BigNumber }> {
  const slippageBps = Math.round(parseFloat(slippagePercentage) * 10000);
  return buildSwapCalldata(
    tokenInAddress,
    tokenOutAddress,
    BigNumber.from(exactAmountInMantissa),
    recipientAddress,
    slippageBps,
  );
}

async function getNativeSwapData(
  tokenOutAddress: string,
  exactAmountInMantissa: string,
  recipientAddress: string,
  slippagePercentage: string = "0.01",
): Promise<{ swapData: string; minAmountOut: BigNumber; amountOut: BigNumber }> {
  return getSwapData(NATIVE_TOKEN_ADDR, tokenOutAddress, exactAmountInMantissa, recipientAddress, slippagePercentage);
}

// =============================================================================
// Results Tracker
// =============================================================================

interface SwapRouterResult {
  section: string;
  test: string;
  status: "PASSED" | "SKIPPED" | "FAILED";
  detail: string;
}
const swapRouterResults: SwapRouterResult[] = [];

function printSwapRouterResultsSummary() {
  const passed = swapRouterResults.filter(r => r.status === "PASSED");
  const failed = swapRouterResults.filter(r => r.status === "FAILED");
  const skipped = swapRouterResults.filter(r => r.status === "SKIPPED");

  console.log("\n" + "=".repeat(120));
  console.log("  SWAP ROUTER RESULTS SUMMARY");
  console.log("=".repeat(120));

  for (const [label, list] of [
    ["PASSED", passed],
    ["FAILED", failed],
    ["SKIPPED", skipped],
  ] as const) {
    if (list.length === 0) continue;
    console.log(`\n  ${label} (${list.length})`);
    console.log("  " + "-".repeat(116));
    console.log(`  ${"Section".padEnd(30)} ${"Test".padEnd(55)} ${label === "PASSED" ? "Detail" : "Reason"}`);
    console.log("  " + "-".repeat(116));
    for (const r of list) {
      console.log(`  ${r.section.padEnd(30)} ${r.test.padEnd(55)} ${r.detail}`);
    }
  }

  console.log("\n" + "=".repeat(120));
  console.log(
    `  Total: ${swapRouterResults.length} | Passed: ${passed.length} | Failed: ${failed.length} | Skipped: ${skipped.length}`,
  );
  console.log("=".repeat(120) + "\n");
}

// =============================================================================
// Helpers
// =============================================================================

function parseEventFromReceipt(receipt: any, eventName: string): any[] {
  const iface = new ethers.utils.Interface(SWAP_ROUTER_ABI);
  return receipt.logs
    .map((log: { topics: string[]; data: string }) => {
      try {
        return iface.parseLog(log);
      } catch {
        return null;
      }
    })
    .filter((e: { name: string } | null) => e && e.name === eventName);
}

// =============================================================================
// Test Suite
// =============================================================================

forking(FORK_BLOCK, async () => {
  let swapRouter: Contract;
  let comptroller: Contract;
  let usdt: Contract;
  let usdc: Contract;
  let vUSDTContract: Contract;
  let vUSDCContract: Contract;
  let impersonatedTimelock: Signer;
  let testUser: Signer;
  let testUserAddress: string;

  before(async () => {
    // Instantiate contracts (pure local — no RPC)
    swapRouter = await ethers.getContractAt(SWAP_ROUTER_ABI, SWAP_ROUTER);
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    vUSDTContract = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);
    vUSDCContract = new ethers.Contract(vUSDC, VTOKEN_ABI, ethers.provider);

    const signers = await ethers.getSigners();
    testUser = signers[0];
    testUserAddress = await testUser.getAddress();

    // Step 1: Impersonate users and setup swap signer (no shared-signer conflicts)
    const [, usdtHolder, usdcHolder, timelockSigner] = await Promise.all([
      setupSwapSigner(),
      initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("10")),
      initMainnetUser(USDC_HOLDER, ethers.utils.parseEther("10")),
      initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("10")),
    ]);
    impersonatedTimelock = timelockSigner;

    // Step 2: Configure oracles
    // Chainlink calls use NORMAL_TIMELOCK as signer — must be sequential to avoid nonce conflicts
    await setMaxStalePeriodInChainlinkOracle(
      bscmainnet.CHAINLINK_ORACLE,
      USDC,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );
    await setMaxStalePeriodInChainlinkOracle(
      bscmainnet.CHAINLINK_ORACLE,
      USDT,
      ethers.constants.AddressZero,
      bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );
    // Binance oracle calls use oracle.owner() as signer — same owner so also sequential
    await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "USDC", 315360000);
    await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "USDT", 315360000);

    // Step 3: Fund test user (different signers — safe in parallel)
    await Promise.all([
      usdt.connect(usdtHolder).transfer(testUserAddress, parseUnits("10000", 18)),
      usdc.connect(usdcHolder).transfer(testUserAddress, parseUnits("10000", 18)),
    ]);
  });

  // ===========================================================================
  // Pre-VIP
  // ===========================================================================

  describe("Pre-VIP behavior", () => {
    it("should have correct ownership state and immutable parameters", async () => {
      const [pendingOwner, owner, comptrollerAddr, swapHelperAddr, wrappedNative, nativeVToken, nativeTokenAddr] =
        await Promise.all([
          swapRouter.pendingOwner(),
          swapRouter.owner(),
          swapRouter.COMPTROLLER(),
          swapRouter.SWAP_HELPER(),
          swapRouter.WRAPPED_NATIVE(),
          swapRouter.NATIVE_VTOKEN(),
          swapRouter.NATIVE_TOKEN_ADDR(),
        ]);

      const isValidState = pendingOwner === bscmainnet.NORMAL_TIMELOCK || owner === bscmainnet.NORMAL_TIMELOCK;
      expect(isValidState).to.be.true;
      expect(comptrollerAddr).to.equal(UNITROLLER);
      expect(swapHelperAddr).to.equal(SWAP_HELPER);
      expect(wrappedNative).to.equal(WBNB);
      expect(nativeVToken).to.equal(vBNB);
      expect(nativeTokenAddr).to.equal(NATIVE_TOKEN_ADDR);
    });
  });

  // ===========================================================================
  // VIP Execution
  // ===========================================================================

  testVip("VIP-600", await vip600(), {
    callbackAfterExecution: async txResponse => {
      const receipt = await txResponse.wait();
      const events = parseEventFromReceipt(receipt, "OwnershipTransferred");
      expect(events.length).to.be.lte(1);
    },
  });

  // ===========================================================================
  // Post-VIP
  // ===========================================================================

  describe("Post-VIP behavior", () => {
    it("should have NORMAL_TIMELOCK as owner with zero pending owner", async () => {
      const [owner, pendingOwner] = await Promise.all([swapRouter.owner(), swapRouter.pendingOwner()]);
      expect(owner).to.equal(bscmainnet.NORMAL_TIMELOCK);
      expect(pendingOwner).to.equal(ethers.constants.AddressZero);
    });
  });

  // ===========================================================================
  // swapAndSupply
  // ===========================================================================

  describe("swapAndSupply", () => {
    it("should swap USDT -> USDC and supply to vUSDC", async () => {
      const amountIn = parseUnits("100", 18);
      const { swapData, minAmountOut } = await getSwapData(USDT, USDC, amountIn.toString(), SWAP_ROUTER, "0.01");

      const [usdtBefore, vUSDCBefore] = await Promise.all([
        usdt.balanceOf(testUserAddress),
        vUSDCContract.balanceOf(testUserAddress),
      ]);

      await usdt.connect(testUser).approve(SWAP_ROUTER, amountIn);

      const tx = await swapRouter.connect(testUser).swapAndSupply(vUSDC, USDT, amountIn, minAmountOut, swapData);
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SwapAndSupply");
      expect(events.length).to.equal(1);
      expect(events[0].args.user.toLowerCase()).to.equal(testUserAddress.toLowerCase());
      expect(events[0].args.amountIn).to.equal(amountIn);
      expect(events[0].args.amountOut).to.be.gte(minAmountOut);

      const [usdtAfter, vUSDCAfter] = await Promise.all([
        usdt.balanceOf(testUserAddress),
        vUSDCContract.balanceOf(testUserAddress),
      ]);
      expect(usdtAfter).to.be.lt(usdtBefore);
      expect(vUSDCAfter).to.be.gt(vUSDCBefore);

      swapRouterResults.push({
        section: "swapAndSupply",
        test: "USDT -> USDC supply to vUSDC",
        status: "PASSED",
        detail: `amountIn: ${amountIn}, amountOut: ${events[0].args.amountOut}`,
      });
    });

    it("should revert with MarketNotListed, ZeroAmount, and ZeroAddress", async () => {
      await usdt.connect(testUser).approve(SWAP_ROUTER, parseUnits("100", 18));

      await expect(
        swapRouter
          .connect(testUser)
          .swapAndSupply("0x0000000000000000000000000000000000000001", USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "MarketNotListed");
      await expect(swapRouter.connect(testUser).swapAndSupply(vUSDC, USDT, 0, 0, "0x")).to.be.revertedWithCustomError(
        swapRouter,
        "ZeroAmount",
      );
      await expect(
        swapRouter.connect(testUser).swapAndSupply(ethers.constants.AddressZero, USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "ZeroAddress");

      for (const name of ["MarketNotListed", "ZeroAmount", "ZeroAddress"]) {
        swapRouterResults.push({
          section: "swapAndSupply",
          test: `Revert ${name}`,
          status: "PASSED",
          detail: "Correctly reverted",
        });
      }
    });
  });

  // ===========================================================================
  // swapAndRepay
  // ===========================================================================

  describe("swapAndRepay", () => {
    before(async () => {
      const supplyAmount = parseUnits("5000", 18);
      await usdc.connect(testUser).approve(vUSDC, supplyAmount);
      await vUSDCContract.connect(testUser).mint(supplyAmount);
      await comptroller.connect(testUser).enterMarkets([vUSDC]);
      await vUSDTContract.connect(testUser).borrow(parseUnits("1000", 18));
    });

    it("should swap USDC -> USDT and repay vUSDT borrow", async () => {
      const amountIn = parseUnits("500", 18);
      const [borrowBefore, { swapData, minAmountOut }] = await Promise.all([
        vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress),
        getSwapData(USDC, USDT, amountIn.toString(), SWAP_ROUTER, "0.01"),
      ]);
      expect(borrowBefore).to.be.gt(0);

      await usdc.connect(testUser).approve(SWAP_ROUTER, amountIn);

      const tx = await swapRouter.connect(testUser).swapAndRepay(vUSDT, USDC, amountIn, minAmountOut, swapData);
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SwapAndRepay");
      expect(events.length).to.equal(1);
      expect(events[0].args.amountRepaid).to.be.gt(0);

      const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      expect(borrowAfter).to.be.lt(borrowBefore);

      swapRouterResults.push({
        section: "swapAndRepay",
        test: "USDC -> USDT repay vUSDT borrow",
        status: "PASSED",
        detail: `Borrow: ${borrowBefore} -> ${borrowAfter}`,
      });
    });

    it("should revert with ZeroAddress when vToken is zero", async () => {
      await expect(
        swapRouter.connect(testUser).swapAndRepay(ethers.constants.AddressZero, USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "ZeroAddress");

      swapRouterResults.push({
        section: "swapAndRepay",
        test: "Revert ZeroAddress",
        status: "PASSED",
        detail: "Correctly reverted",
      });
    });
  });

  // ===========================================================================
  // swapAndRepayFull
  // ===========================================================================

  describe("swapAndRepayFull", () => {
    before(async () => {
      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      if (borrowBalance.eq(0)) {
        const supplyAmount = parseUnits("2000", 18);
        await usdc.connect(testUser).approve(vUSDC, supplyAmount);
        await vUSDCContract.connect(testUser).mint(supplyAmount);
        await vUSDTContract.connect(testUser).borrow(parseUnits("500", 18));
      }
    });

    it("should swap USDC -> USDT and fully repay vUSDT borrow", async () => {
      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      if (borrowBalance.eq(0)) {
        swapRouterResults.push({
          section: "swapAndRepayFull",
          test: "USDC -> USDT full repay vUSDT",
          status: "SKIPPED",
          detail: "No borrow balance",
        });
        console.log("    [SKIP] No borrow balance");
        return;
      }

      const maxAmountIn = borrowBalance.mul(110).div(100);
      const { swapData } = await getSwapData(USDC, USDT, maxAmountIn.toString(), SWAP_ROUTER, "0.01");

      await usdc.connect(testUser).approve(SWAP_ROUTER, maxAmountIn);

      const tx = await swapRouter.connect(testUser).swapAndRepayFull(vUSDT, USDC, maxAmountIn, swapData);
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SwapAndRepay");
      expect(events.length).to.equal(1);

      const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      expect(borrowAfter).to.equal(0);

      swapRouterResults.push({
        section: "swapAndRepayFull",
        test: "USDC -> USDT full repay vUSDT",
        status: "PASSED",
        detail: `Borrow: ${borrowBalance} -> 0`,
      });
    });
  });

  // ===========================================================================
  // swapNativeAndSupply
  // ===========================================================================

  describe("swapNativeAndSupply", () => {
    it("should swap BNB -> USDT and supply to vUSDT", async () => {
      const amountIn = parseUnits("1", 18);
      const [{ swapData, minAmountOut }, vUSDTBefore] = await Promise.all([
        getNativeSwapData(USDT, amountIn.toString(), SWAP_ROUTER, "0.01"),
        vUSDTContract.balanceOf(testUserAddress),
      ]);

      const tx = await swapRouter
        .connect(testUser)
        .swapNativeAndSupply(vUSDT, minAmountOut, swapData, { value: amountIn });
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SwapAndSupply");
      expect(events.length).to.equal(1);
      expect(events[0].args.tokenIn.toLowerCase()).to.equal(WBNB.toLowerCase());

      expect(await vUSDTContract.balanceOf(testUserAddress)).to.be.gt(vUSDTBefore);

      swapRouterResults.push({
        section: "swapNativeAndSupply",
        test: "BNB -> USDT supply to vUSDT",
        status: "PASSED",
        detail: `amountIn: ${amountIn}, amountOut: ${events[0].args.amountOut}`,
      });
    });
  });

  // ===========================================================================
  // swapNativeAndRepay
  // ===========================================================================

  describe("swapNativeAndRepay", () => {
    before(async () => {
      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      if (borrowBalance.eq(0)) {
        const supplyAmount = parseUnits("2000", 18);
        await usdc.connect(testUser).approve(vUSDC, supplyAmount);
        await vUSDCContract.connect(testUser).mint(supplyAmount);
        await vUSDTContract.connect(testUser).borrow(parseUnits("500", 18));
      }
    });

    it("should swap BNB -> USDT and repay vUSDT borrow", async () => {
      const amountIn = parseUnits("0.5", 18);
      const borrowBefore = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);

      if (borrowBefore.eq(0)) {
        swapRouterResults.push({
          section: "swapNativeAndRepay",
          test: "BNB -> USDT repay vUSDT",
          status: "SKIPPED",
          detail: "No borrow balance",
        });
        console.log("    [SKIP] No borrow balance");
        return;
      }

      const { swapData, minAmountOut } = await getNativeSwapData(USDT, amountIn.toString(), SWAP_ROUTER, "0.01");

      const tx = await swapRouter
        .connect(testUser)
        .swapNativeAndRepay(vUSDT, minAmountOut, swapData, { value: amountIn });
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SwapAndRepay");
      expect(events.length).to.equal(1);

      const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      expect(borrowAfter).to.be.lt(borrowBefore);

      swapRouterResults.push({
        section: "swapNativeAndRepay",
        test: "BNB -> USDT repay vUSDT",
        status: "PASSED",
        detail: `Borrow: ${borrowBefore} -> ${borrowAfter}`,
      });
    });
  });

  // ===========================================================================
  // swapNativeAndRepayFull
  // ===========================================================================

  describe("swapNativeAndRepayFull", () => {
    before(async () => {
      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      if (borrowBalance.eq(0)) {
        const supplyAmount = parseUnits("1000", 18);
        await usdc.connect(testUser).approve(vUSDC, supplyAmount);
        await vUSDCContract.connect(testUser).mint(supplyAmount);
        await vUSDTContract.connect(testUser).borrow(parseUnits("100", 18));
      }
    });

    it("should swap BNB -> USDT and fully repay vUSDT borrow", async () => {
      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      if (borrowBalance.eq(0)) {
        swapRouterResults.push({
          section: "swapNativeAndRepayFull",
          test: "BNB -> USDT full repay vUSDT",
          status: "SKIPPED",
          detail: "No borrow balance",
        });
        console.log("    [SKIP] No borrow balance");
        return;
      }

      const amountIn = parseUnits("1", 18);
      const { swapData } = await getNativeSwapData(USDT, amountIn.toString(), SWAP_ROUTER, "0.01");

      const tx = await swapRouter.connect(testUser).swapNativeAndRepayFull(vUSDT, swapData, { value: amountIn });
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SwapAndRepay");
      expect(events.length).to.equal(1);

      const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      expect(borrowAfter).to.equal(0);

      swapRouterResults.push({
        section: "swapNativeAndRepayFull",
        test: "BNB -> USDT full repay vUSDT",
        status: "PASSED",
        detail: `Borrow: ${borrowBalance} -> 0`,
      });
    });
  });

  // ===========================================================================
  // sweepToken
  // ===========================================================================

  describe("sweepToken", () => {
    it("should allow owner to sweep ERC20 tokens stuck in the router", async () => {
      const accidentalAmount = parseUnits("10", 18);
      const usdtHolder = await initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("1"));
      await usdt.connect(usdtHolder).transfer(SWAP_ROUTER, accidentalAmount);

      const [routerBalanceBefore, ownerAddress] = await Promise.all([usdt.balanceOf(SWAP_ROUTER), swapRouter.owner()]);
      expect(routerBalanceBefore).to.be.gte(accidentalAmount);

      const ownerBalanceBefore = await usdt.balanceOf(ownerAddress);

      const tx = await swapRouter.connect(impersonatedTimelock).sweepToken(USDT);
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SweepToken");
      expect(events.length).to.equal(1);
      expect(events[0].args.token.toLowerCase()).to.equal(USDT.toLowerCase());
      expect(events[0].args.amount).to.equal(routerBalanceBefore);

      const [routerBalanceAfter, ownerBalanceAfter] = await Promise.all([
        usdt.balanceOf(SWAP_ROUTER),
        usdt.balanceOf(ownerAddress),
      ]);
      expect(routerBalanceAfter).to.equal(0);
      expect(ownerBalanceAfter.sub(ownerBalanceBefore)).to.equal(routerBalanceBefore);

      swapRouterResults.push({
        section: "sweepToken",
        test: "Owner sweeps ERC20 tokens",
        status: "PASSED",
        detail: `Swept ${routerBalanceBefore} USDT`,
      });
    });

    it("should revert when called by non-owner", async () => {
      await expect(swapRouter.connect(testUser).sweepToken(USDT)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );

      swapRouterResults.push({
        section: "sweepToken",
        test: "Revert when called by non-owner",
        status: "PASSED",
        detail: "Correctly reverted",
      });
    });
  });

  // ===========================================================================
  // sweepNative
  // ===========================================================================

  describe("sweepNative", () => {
    it("should allow owner to sweep native BNB stuck in the router", async () => {
      const forcedAmount = parseUnits("0.1", 18);
      await ethers.provider.send("hardhat_setBalance", [
        SWAP_ROUTER,
        ethers.utils.hexStripZeros(forcedAmount.toHexString()),
      ]);

      const routerBalance = await ethers.provider.getBalance(SWAP_ROUTER);
      expect(routerBalance).to.be.gt(0);

      const tx = await swapRouter.connect(impersonatedTimelock).sweepNative();
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SweepNative");
      expect(events.length).to.equal(1);
      expect(events[0].args.amount).to.equal(routerBalance);

      expect(await ethers.provider.getBalance(SWAP_ROUTER)).to.equal(0);

      swapRouterResults.push({
        section: "sweepNative",
        test: "Owner sweeps native BNB",
        status: "PASSED",
        detail: `Swept ${routerBalance} wei BNB`,
      });
    });

    it("should revert for non-owner and unauthorized native sender", async () => {
      await expect(swapRouter.connect(testUser).sweepNative()).to.be.revertedWith("Ownable: caller is not the owner");
      await expect(
        testUser.sendTransaction({ to: SWAP_ROUTER, value: parseUnits("0.1", 18) }),
      ).to.be.revertedWithCustomError(swapRouter, "UnauthorizedNativeSender");

      swapRouterResults.push(
        {
          section: "sweepNative",
          test: "Revert when called by non-owner",
          status: "PASSED",
          detail: "Correctly reverted",
        },
        {
          section: "sweepNative",
          test: "Revert UnauthorizedNativeSender",
          status: "PASSED",
          detail: "Correctly reverted",
        },
      );
    });
  });

  // ===========================================================================
  // Error Cases
  // ===========================================================================

  describe("Error cases", () => {
    it("should revert with MarketNotListed and SwapFailed", async () => {
      await usdt.connect(testUser).approve(SWAP_ROUTER, parseUnits("100", 18));

      await expect(
        swapRouter
          .connect(testUser)
          .swapAndSupply("0x0000000000000000000000000000000000000001", USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "MarketNotListed");
      await expect(
        swapRouter.connect(testUser).swapAndSupply(vUSDC, USDT, parseUnits("100", 18), 0, "0xdeadbeef"),
      ).to.be.revertedWithCustomError(swapRouter, "SwapFailed");

      swapRouterResults.push(
        { section: "Error cases", test: "Revert MarketNotListed", status: "PASSED", detail: "Correctly reverted" },
        { section: "Error cases", test: "Revert SwapFailed", status: "PASSED", detail: "Correctly reverted" },
      );
    });
  });

  // ===========================================================================
  // Ownership
  // ===========================================================================

  describe("Ownership", () => {
    it("should have correct owner after VIP execution", async () => {
      expect(await swapRouter.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("should support two-step ownership transfer", async () => {
      const newOwner = testUserAddress;

      await swapRouter.connect(impersonatedTimelock).transferOwnership(newOwner);
      expect(await swapRouter.pendingOwner()).to.equal(newOwner);

      await swapRouter.connect(testUser).acceptOwnership();
      expect(await swapRouter.owner()).to.equal(newOwner);

      // Cleanup
      await swapRouter.connect(testUser).transferOwnership(bscmainnet.NORMAL_TIMELOCK);
      await swapRouter.connect(impersonatedTimelock).acceptOwnership();
      expect(await swapRouter.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });
  });

  // ===========================================================================
  // Integration
  // ===========================================================================

  describe("Integration: full supply -> borrow -> repay cycle", () => {
    it("should complete entire user journey via swap router", async () => {
      const signers = await ethers.getSigners();
      const integrationUser = signers[5];
      const integrationUserAddress = await integrationUser.getAddress();

      await initMainnetUser(integrationUserAddress, parseUnits("10", 18));

      // Step 1: Swap 2 BNB -> USDC and supply to vUSDC
      const bnbToSupply = parseUnits("2", 18);
      const { swapData: supplySwapData, minAmountOut: supplyMinOut } = await getNativeSwapData(
        USDC,
        bnbToSupply.toString(),
        SWAP_ROUTER,
        "0.02",
      );

      await swapRouter
        .connect(integrationUser)
        .swapNativeAndSupply(vUSDC, supplyMinOut, supplySwapData, { value: bnbToSupply });

      const vUSDCBalance = await vUSDCContract.balanceOf(integrationUserAddress);
      expect(vUSDCBalance).to.be.gt(0);

      // Step 2: Enter market and borrow
      await comptroller.connect(integrationUser).enterMarkets([vUSDC]);
      await vUSDTContract.connect(integrationUser).borrow(parseUnits("100", 18));

      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(integrationUserAddress);
      expect(borrowBalance).to.be.gt(0);

      // Step 3: Swap 0.5 BNB -> USDT and partially repay
      const bnbToRepay = parseUnits("0.5", 18);
      const { swapData: repaySwapData, minAmountOut: repayMinOut } = await getNativeSwapData(
        USDT,
        bnbToRepay.toString(),
        SWAP_ROUTER,
        "0.02",
      );

      await swapRouter
        .connect(integrationUser)
        .swapNativeAndRepay(vUSDT, repayMinOut, repaySwapData, { value: bnbToRepay });

      const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(integrationUserAddress);
      expect(borrowAfter).to.be.lt(borrowBalance);

      swapRouterResults.push({
        section: "Integration",
        test: "Full supply -> borrow -> repay cycle",
        status: "PASSED",
        detail: `Supply vUSDC: ${vUSDCBalance}, Borrow: ${borrowBalance} -> ${borrowAfter}`,
      });
    });
  });

  after(() => {
    printSwapRouterResultsSummary();
  });
});
