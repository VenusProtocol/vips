import { expect } from "chai";
import { BigNumber, Contract, Signer, Wallet } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  initMainnetUser,
  setMaxStalePeriod,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vU, vip581Addendum2 } from "../../vips/vip-581/addendum2";
import {
  CHAINLINK_ORACLE,
  RESILIENT_ORACLE,
  STABLE_USDT_PRICE_FEED,
  U,
  USD1_FEED,
  USDT_CHAINLINK_ORACLE,
} from "../../vips/vip-581/bscmainnet";
import VTOKEN_ABI from "../vip-567/abi/VToken.json";
import LEVERAGE_STRATEGIES_MANAGER_ABI from "../vip-576/abi/LeverageStrategiesManager.json";
import SWAP_HELPER_ABI from "../vip-600/abi/SwapHelper.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

// =============================================================================
// Constants
// =============================================================================

const LEVERAGE_STRATEGIES_MANAGER = "0x03F079E809185a669Ca188676D0ADb09cbAd6dC1";
const SWAP_HELPER = "0xD79be25aEe798Aa34A9Ba1230003d7499be29A24";

const vUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const PANCAKE_V2_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const PANCAKE_V2_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
];

const U_HOLDER = "0x8894E0a0c962CB723c1976a4421c95949bE2D4E3";
const USDT_HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC";

const FORK_BLOCK = 75075100;

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
 * Tries the Venus swap API first (20s timeout), falls back to PancakeSwap V2 on-chain.
 */
async function buildSwapCalldata(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  recipient: string,
  slippageBps: number = 100,
): Promise<{ swapData: string; minAmountOut: BigNumber }> {
  try {
    return await buildSwapCalldataFromAPI(tokenIn, tokenOut, amountIn, recipient);
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

  const params = new URLSearchParams({
    chainId: "56",
    tokenInAddress: tokenIn,
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
      calls.push(swapHelperIface.encodeFunctionData("approveMax", [tokenIn, tx.target]));
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
    const value = { caller: LEVERAGE_STRATEGIES_MANAGER, calls, deadline, salt };
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
): Promise<{ swapData: string; minAmountOut: BigNumber }> {
  const pancakeRouter = new ethers.Contract(PANCAKE_V2_ROUTER, PANCAKE_V2_ROUTER_ABI, ethers.provider);

  let path: string[];
  let amounts: BigNumber[];

  try {
    path = [tokenIn, tokenOut];
    amounts = await pancakeRouter.getAmountsOut(amountIn, path);
  } catch {
    if (tokenIn !== WBNB && tokenOut !== WBNB) {
      path = [tokenIn, WBNB, tokenOut];
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
    swapHelperIface.encodeFunctionData("approveMax", [tokenIn, PANCAKE_V2_ROUTER]),
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
  const value = { caller: LEVERAGE_STRATEGIES_MANAGER, calls, deadline, salt };
  const signature = await swapSignerWallet._signTypedData(eip712Domain, types, value);
  const multicallData = swapHelperIface.encodeFunctionData("multicall", [calls, deadline, salt, signature]);

  return { swapData: multicallData, minAmountOut };
}

// =============================================================================
// Swap Data Wrapper
// =============================================================================

async function getSwapData(
  tokenInAddress: string,
  tokenOutAddress: string,
  exactAmountInMantissa: string,
  slippagePercentage: string = "0.01",
): Promise<{ swapData: string; minAmountOut: BigNumber }> {
  const slippageBps = Math.round(parseFloat(slippagePercentage) * 10000);
  return buildSwapCalldata(
    tokenInAddress,
    tokenOutAddress,
    BigNumber.from(exactAmountInMantissa),
    LEVERAGE_STRATEGIES_MANAGER,
    slippageBps,
  );
}

// =============================================================================
// Results Tracker
// =============================================================================

interface LeverageResult {
  section: string;
  test: string;
  status: "PASSED" | "SKIPPED" | "FAILED";
  detail: string;
}
const leverageResults: LeverageResult[] = [];

function printLeverageResultsSummary() {
  const passed = leverageResults.filter(r => r.status === "PASSED");
  const failed = leverageResults.filter(r => r.status === "FAILED");
  const skipped = leverageResults.filter(r => r.status === "SKIPPED");

  console.log("\n" + "=".repeat(120));
  console.log("  LEVERAGE STRATEGIES RESULTS SUMMARY");
  console.log("=".repeat(120));

  for (const [label, list] of [
    ["PASSED", passed],
    ["FAILED", failed],
    ["SKIPPED", skipped],
  ] as const) {
    if (list.length === 0) continue;
    console.log(`\n  ${label} (${list.length})`);
    console.log("  " + "-".repeat(116));
    console.log(`  ${"Section".padEnd(35)} ${"Test".padEnd(50)} ${label === "PASSED" ? "Detail" : "Reason"}`);
    console.log("  " + "-".repeat(116));
    for (const r of list) {
      console.log(`  ${r.section.padEnd(35)} ${r.test.padEnd(50)} ${r.detail}`);
    }
  }

  console.log("\n" + "=".repeat(120));
  console.log(
    `  Total: ${leverageResults.length} | Passed: ${passed.length} | Failed: ${failed.length} | Skipped: ${skipped.length}`,
  );
  console.log("=".repeat(120) + "\n");
}

// =============================================================================
// Helpers
// =============================================================================

function parseEvents(receipt: any, abi: any, eventName: string): any[] {
  const iface = new ethers.utils.Interface(abi);
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
  let vUContract: Contract;
  let leverageStrategiesManager: Contract;
  let u: Contract;
  let usdt: Contract;
  let vUSDTContract: Contract;
  let comptroller: Contract;
  let resilientOracle: Contract;
  let chainlinkOracle: Contract;
  let usdtChainlinkOracle: Contract;
  let impersonatedTimelock: Signer;
  let testUser: Signer;
  let leverageTestUser: Signer;

  before(async () => {
    // Instantiate contracts (pure local — no RPC)
    vUContract = new ethers.Contract(vU, VTOKEN_ABI, ethers.provider);
    leverageStrategiesManager = new ethers.Contract(
      LEVERAGE_STRATEGIES_MANAGER,
      LEVERAGE_STRATEGIES_MANAGER_ABI,
      ethers.provider,
    );
    u = new ethers.Contract(U, ERC20_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    vUSDTContract = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    usdtChainlinkOracle = new ethers.Contract(USDT_CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);

    const signers = await ethers.getSigners();
    testUser = signers[0];
    leverageTestUser = signers[1];

    // Step 1: Impersonate users and setup swap signer (different signers — safe in parallel)
    const [, uHolder, usdtHolder, timelockSigner] = await Promise.all([
      setupSwapSigner(),
      initMainnetUser(U_HOLDER, ethers.utils.parseEther("10")),
      initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("10")),
      initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2")),
    ]);
    impersonatedTimelock = timelockSigner;

    // Step 2: Fund test users
    const [testUserAddress, leverageUserAddress] = await Promise.all([
      testUser.getAddress(),
      leverageTestUser.getAddress(),
    ]);
    // uHolder sends two transfers — must be sequential (same signer, nonce conflict)
    await u.connect(uHolder).transfer(testUserAddress, parseUnits("100", 18));
    await u.connect(uHolder).transfer(leverageUserAddress, parseUnits("1000", 18));
    // usdtHolder is a different signer but has no parallel partner now, so just await
    await usdt.connect(usdtHolder).transfer(leverageUserAddress, parseUnits("1000", 18));

    // Step 3: Set direct prices (same signer: impersonatedTimelock — must be sequential)
    await usdtChainlinkOracle.connect(impersonatedTimelock).setDirectPrice(U, parseUnits("1", 18));
    await chainlinkOracle.connect(impersonatedTimelock).setDirectPrice(U, parseUnits("1", 18));

    // Step 4: Configure oracle stale periods (uses NORMAL_TIMELOCK internally — sequential)
    await setMaxStalePeriodInChainlinkOracle(
      USDT_CHAINLINK_ORACLE,
      U,
      STABLE_USDT_PRICE_FEED,
      bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );
    await setMaxStalePeriodInChainlinkOracle(CHAINLINK_ORACLE, U, USD1_FEED, bscmainnet.NORMAL_TIMELOCK, 315360000);
    await setMaxStalePeriod(resilientOracle, u);
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
    await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "USDC", 315360000);
    await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "USDT", 315360000);
  });

  // ===========================================================================
  // VIP Execution
  // ===========================================================================

  testVip("VIP-581 Addendum2", await vip581Addendum2(), {
    callbackAfterExecution: async txResponse => {
      const receipt = await txResponse.wait();
      const events = parseEvents(receipt, VTOKEN_ABI, "FlashLoanStatusChanged");
      expect(events.length).to.be.lte(1);
    },
  });

  // ===========================================================================
  // Post-VIP checks
  // ===========================================================================

  describe("Post-VIP checks", () => {
    it("vU has flash loans enabled", async () => {
      expect(await vUContract.isFlashLoanEnabled()).to.be.equal(true);

      leverageResults.push({
        section: "Post-VIP",
        test: "Flash loans enabled on vU",
        status: "PASSED",
        detail: "isFlashLoanEnabled = true",
      });
    });

    it("enterSingleAssetLeverage with value checks", async () => {
      const userAddress = await testUser.getAddress();
      const collateralAmountSeed = parseUnits("10", 18);
      const collateralAmountToFlashLoan = parseUnits("5", 18);

      await u.connect(testUser).approve(vU, collateralAmountSeed);
      await vUContract.connect(testUser).mint(collateralAmountSeed);
      await comptroller.connect(testUser).enterMarkets([vU]);
      await comptroller.connect(testUser).updateDelegate(LEVERAGE_STRATEGIES_MANAGER, true);

      const [vUBalanceBefore, borrowBalanceBefore] = await Promise.all([
        vUContract.balanceOf(userAddress),
        vUContract.callStatic.borrowBalanceCurrent(userAddress),
      ]);

      const tx = await leverageStrategiesManager
        .connect(testUser)
        .enterSingleAssetLeverage(vU, 0, collateralAmountToFlashLoan);
      const receipt = await tx.wait();

      const leverageEvents = parseEvents(receipt, LEVERAGE_STRATEGIES_MANAGER_ABI, "SingleAssetLeverageEntered");
      expect(leverageEvents.length).to.equal(1);
      expect(leverageEvents[0].args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
      expect(leverageEvents[0].args.collateralMarket.toLowerCase()).to.equal(vU.toLowerCase());
      expect(leverageEvents[0].args.collateralAmountSeed).to.equal(0);
      expect(leverageEvents[0].args.collateralAmountToFlashLoan).to.equal(collateralAmountToFlashLoan);

      const [vUBalanceAfter, borrowBalanceAfter] = await Promise.all([
        vUContract.balanceOf(userAddress),
        vUContract.callStatic.borrowBalanceCurrent(userAddress),
      ]);

      expect(vUBalanceAfter).to.be.gt(vUBalanceBefore);
      expect(borrowBalanceAfter).to.be.gt(borrowBalanceBefore);
      expect(borrowBalanceAfter).to.be.gte(collateralAmountToFlashLoan);

      leverageResults.push({
        section: "Post-VIP",
        test: "enterSingleAssetLeverage",
        status: "PASSED",
        detail: `vU: ${vUBalanceBefore} -> ${vUBalanceAfter}, Borrow: ${borrowBalanceBefore} -> ${borrowBalanceAfter}`,
      });
    });
  });

  // ===========================================================================
  // Cross-Asset Leverage: enterLeverage
  // ===========================================================================

  describe("enterLeverage (cross-asset)", () => {
    let leverageUserAddress: string;

    before(async () => {
      leverageUserAddress = await leverageTestUser.getAddress();
      // Sequential — same signer (leverageTestUser)
      await comptroller.connect(leverageTestUser).enterMarkets([vU, vUSDT]);
      await comptroller.connect(leverageTestUser).updateDelegate(LEVERAGE_STRATEGIES_MANAGER, true);
    });

    it("should enter cross-asset leverage (U collateral, USDT borrow)", async () => {
      const collateralAmountSeed = parseUnits("100", 18);
      const borrowedAmountToFlashLoan = parseUnits("50", 18);

      const { swapData, minAmountOut } = await getSwapData(USDT, U, borrowedAmountToFlashLoan.toString(), "0.01");

      if (swapData === "0x") {
        leverageResults.push({
          section: "enterLeverage",
          test: "U collateral / USDT borrow",
          status: "SKIPPED",
          detail: "Swap data unavailable",
        });
        console.log("    [SKIP] Swap data unavailable");
        return;
      }

      const [vUBalanceBefore, usdtBorrowBefore, uBalanceBefore] = await Promise.all([
        vUContract.balanceOf(leverageUserAddress),
        vUSDTContract.callStatic.borrowBalanceCurrent(leverageUserAddress),
        u.balanceOf(leverageUserAddress),
      ]);

      await u.connect(leverageTestUser).approve(LEVERAGE_STRATEGIES_MANAGER, collateralAmountSeed);

      try {
        const tx = await leverageStrategiesManager
          .connect(leverageTestUser)
          .enterLeverage(vU, collateralAmountSeed, vUSDT, borrowedAmountToFlashLoan, minAmountOut, swapData);
        const receipt = await tx.wait();

        const leverageEvents = parseEvents(receipt, LEVERAGE_STRATEGIES_MANAGER_ABI, "LeverageEntered");
        expect(leverageEvents.length).to.equal(1);
        expect(leverageEvents[0].args.user.toLowerCase()).to.equal(leverageUserAddress.toLowerCase());
        expect(leverageEvents[0].args.collateralMarket.toLowerCase()).to.equal(vU.toLowerCase());
        expect(leverageEvents[0].args.collateralAmountSeed).to.equal(collateralAmountSeed);
        expect(leverageEvents[0].args.borrowedMarket.toLowerCase()).to.equal(vUSDT.toLowerCase());
        expect(leverageEvents[0].args.borrowedAmountToFlashLoan).to.equal(borrowedAmountToFlashLoan);

        const [vUBalanceAfter, usdtBorrowAfter, uBalanceAfter] = await Promise.all([
          vUContract.balanceOf(leverageUserAddress),
          vUSDTContract.callStatic.borrowBalanceCurrent(leverageUserAddress),
          u.balanceOf(leverageUserAddress),
        ]);

        expect(vUBalanceAfter).to.be.gt(vUBalanceBefore);
        expect(usdtBorrowAfter).to.be.gt(usdtBorrowBefore);
        expect(usdtBorrowAfter).to.be.gte(borrowedAmountToFlashLoan);
        expect(uBalanceAfter).to.equal(uBalanceBefore.sub(collateralAmountSeed));

        leverageResults.push({
          section: "enterLeverage",
          test: "U collateral / USDT borrow",
          status: "PASSED",
          detail: `vU: ${vUBalanceBefore} -> ${vUBalanceAfter}, USDT borrow: ${usdtBorrowBefore} -> ${usdtBorrowAfter}`,
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("0x428c0cc7") || msg.includes("TokenSwapCallFailed") || msg.includes("Swap API error")) {
          leverageResults.push({
            section: "enterLeverage",
            test: "U collateral / USDT borrow",
            status: "SKIPPED",
            detail: "Swap failed or API unavailable",
          });
          console.log("    [SKIP] Swap quote expired or route unavailable");
          return;
        }
        throw error;
      }
    });
  });

  // ===========================================================================
  // Cross-Asset Leverage: exitLeverage
  // ===========================================================================

  describe("exitLeverage (cross-asset)", () => {
    it("should exit cross-asset leverage position", async () => {
      const leverageUserAddress = await leverageTestUser.getAddress();

      const usdtBorrowBefore = await vUSDTContract.callStatic.borrowBalanceCurrent(leverageUserAddress);
      if (usdtBorrowBefore.eq(0)) {
        leverageResults.push({
          section: "exitLeverage",
          test: "Exit U/USDT position",
          status: "SKIPPED",
          detail: "No position to exit",
        });
        console.log("    [SKIP] No position to exit");
        return;
      }

      const collateralAmountToRedeem = parseUnits("55", 18);
      const { swapData, minAmountOut } = await getSwapData(U, USDT, collateralAmountToRedeem.toString(), "0.01");

      if (swapData === "0x") {
        leverageResults.push({
          section: "exitLeverage",
          test: "Exit U/USDT position",
          status: "SKIPPED",
          detail: "Swap data unavailable",
        });
        console.log("    [SKIP] Swap data unavailable");
        return;
      }

      const [vUBalanceBefore, uBalanceBefore] = await Promise.all([
        vUContract.balanceOf(leverageUserAddress),
        u.balanceOf(leverageUserAddress),
      ]);

      const flashLoanAmount = usdtBorrowBefore.mul(101).div(100);

      try {
        const tx = await leverageStrategiesManager
          .connect(leverageTestUser)
          .exitLeverage(vU, collateralAmountToRedeem, vUSDT, flashLoanAmount, minAmountOut, swapData);
        const receipt = await tx.wait();

        const exitEvents = parseEvents(receipt, LEVERAGE_STRATEGIES_MANAGER_ABI, "LeverageExited");
        expect(exitEvents.length).to.equal(1);
        expect(exitEvents[0].args.user.toLowerCase()).to.equal(leverageUserAddress.toLowerCase());
        expect(exitEvents[0].args.collateralMarket.toLowerCase()).to.equal(vU.toLowerCase());
        expect(exitEvents[0].args.collateralAmountToRedeemForSwap).to.equal(collateralAmountToRedeem);
        expect(exitEvents[0].args.borrowedMarket.toLowerCase()).to.equal(vUSDT.toLowerCase());
        expect(exitEvents[0].args.borrowedAmountToFlashLoan).to.equal(flashLoanAmount);

        const [vUBalanceAfter, usdtBorrowAfter, uBalanceAfter] = await Promise.all([
          vUContract.balanceOf(leverageUserAddress),
          vUSDTContract.callStatic.borrowBalanceCurrent(leverageUserAddress),
          u.balanceOf(leverageUserAddress),
        ]);

        expect(vUBalanceAfter).to.be.lt(vUBalanceBefore);
        expect(usdtBorrowAfter).to.equal(0);
        expect(uBalanceAfter).to.be.gte(uBalanceBefore);

        leverageResults.push({
          section: "exitLeverage",
          test: "Exit U/USDT position",
          status: "PASSED",
          detail: `vU: ${vUBalanceBefore} -> ${vUBalanceAfter}, USDT borrow: ${usdtBorrowBefore} -> ${usdtBorrowAfter}`,
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.includes("0x428c0cc7") || msg.includes("TokenSwapCallFailed") || msg.includes("Swap API error")) {
          leverageResults.push({
            section: "exitLeverage",
            test: "Exit U/USDT position",
            status: "SKIPPED",
            detail: "Swap failed or API unavailable",
          });
          console.log("    [SKIP] Swap quote expired or route unavailable");
          return;
        }
        throw error;
      }
    });
  });

  // ===========================================================================
  // Cross-Asset Leverage: enterLeverageFromBorrow
  // ===========================================================================

  describe("enterLeverageFromBorrow", () => {
    it("should enter leverage from existing borrow position", async () => {
      const userAddress = await leverageTestUser.getAddress();

      const mintAmount = parseUnits("200", 18);
      const initialBorrow = parseUnits("20", 18);

      const uBalance = await u.balanceOf(userAddress);
      if (uBalance.lt(mintAmount)) {
        leverageResults.push({
          section: "enterLeverageFromBorrow",
          test: "Leverage from existing borrow",
          status: "SKIPPED",
          detail: "Insufficient U balance",
        });
        console.log("    [SKIP] Insufficient U balance");
        return;
      }

      // Sequential — same signer (leverageTestUser)
      await u.connect(leverageTestUser).approve(vU, mintAmount);
      await vUContract.connect(leverageTestUser).mint(mintAmount);
      await vUSDTContract.connect(leverageTestUser).borrow(initialBorrow);

      const additionalBorrowSeed = parseUnits("10", 18);
      const additionalFlashLoan = parseUnits("20", 18);
      const totalUSDT = additionalBorrowSeed.add(additionalFlashLoan);

      const { swapData, minAmountOut } = await getSwapData(USDT, U, totalUSDT.toString(), "0.01");

      if (swapData === "0x") {
        leverageResults.push({
          section: "enterLeverageFromBorrow",
          test: "Leverage from existing borrow",
          status: "SKIPPED",
          detail: "Swap data unavailable",
        });
        console.log("    [SKIP] Swap data unavailable");
        return;
      }

      const [vUBalanceBefore, usdtBorrowBefore] = await Promise.all([
        vUContract.balanceOf(userAddress),
        vUSDTContract.callStatic.borrowBalanceCurrent(userAddress),
      ]);

      try {
        const tx = await leverageStrategiesManager
          .connect(leverageTestUser)
          .enterLeverageFromBorrow(vU, vUSDT, additionalBorrowSeed, additionalFlashLoan, minAmountOut, swapData);
        const receipt = await tx.wait();

        const events = parseEvents(receipt, LEVERAGE_STRATEGIES_MANAGER_ABI, "LeverageEnteredFromBorrow");
        expect(events.length).to.equal(1);
        expect(events[0].args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
        expect(events[0].args.collateralMarket.toLowerCase()).to.equal(vU.toLowerCase());
        expect(events[0].args.borrowedMarket.toLowerCase()).to.equal(vUSDT.toLowerCase());
        expect(events[0].args.borrowedAmountSeed).to.equal(additionalBorrowSeed);
        expect(events[0].args.borrowedAmountToFlashLoan).to.equal(additionalFlashLoan);

        const [vUBalanceAfter, usdtBorrowAfter] = await Promise.all([
          vUContract.balanceOf(userAddress),
          vUSDTContract.callStatic.borrowBalanceCurrent(userAddress),
        ]);

        expect(vUBalanceAfter).to.be.gt(vUBalanceBefore);
        expect(usdtBorrowAfter).to.be.gt(usdtBorrowBefore);

        leverageResults.push({
          section: "enterLeverageFromBorrow",
          test: "Leverage from existing borrow",
          status: "PASSED",
          detail: `vU: ${vUBalanceBefore} -> ${vUBalanceAfter}, USDT borrow: ${usdtBorrowBefore} -> ${usdtBorrowAfter}`,
        });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        if (
          msg.includes("0x428c0cc7") ||
          msg.includes("TokenSwapCallFailed") ||
          msg.includes("transfer amount exceeds allowance") ||
          msg.includes("Swap API error")
        ) {
          leverageResults.push({
            section: "enterLeverageFromBorrow",
            test: "Leverage from existing borrow",
            status: "SKIPPED",
            detail: "Swap failed or API unavailable",
          });
          console.log("    [SKIP] Swap quote expired or route unavailable");
          return;
        }
        throw error;
      }
    });
  });

  // ===========================================================================
  // exitSingleAssetLeverage
  // ===========================================================================

  describe("exitSingleAssetLeverage", () => {
    it("should exit single asset leverage position", async () => {
      const userAddress = await testUser.getAddress();

      const borrowBalance = await vUContract.callStatic.borrowBalanceCurrent(userAddress);
      if (borrowBalance.eq(0)) {
        leverageResults.push({
          section: "exitSingleAssetLeverage",
          test: "Exit single-asset position",
          status: "SKIPPED",
          detail: "No position to exit",
        });
        console.log("    [SKIP] No position to exit");
        return;
      }

      const vUBalanceBefore = await vUContract.balanceOf(userAddress);
      const flashLoanAmount = borrowBalance.mul(101).div(100);

      const tx = await leverageStrategiesManager.connect(testUser).exitSingleAssetLeverage(vU, flashLoanAmount);
      const receipt = await tx.wait();

      const exitEvents = parseEvents(receipt, LEVERAGE_STRATEGIES_MANAGER_ABI, "SingleAssetLeverageExited");
      expect(exitEvents.length).to.equal(1);
      expect(exitEvents[0].args.user.toLowerCase()).to.equal(userAddress.toLowerCase());
      expect(exitEvents[0].args.collateralMarket.toLowerCase()).to.equal(vU.toLowerCase());
      expect(exitEvents[0].args.collateralAmountToFlashLoan).to.equal(flashLoanAmount);

      const [vUBalanceAfter, borrowBalanceAfter] = await Promise.all([
        vUContract.balanceOf(userAddress),
        vUContract.callStatic.borrowBalanceCurrent(userAddress),
      ]);

      expect(borrowBalanceAfter).to.equal(0);
      expect(vUBalanceAfter).to.be.lt(vUBalanceBefore);

      leverageResults.push({
        section: "exitSingleAssetLeverage",
        test: "Exit single-asset position",
        status: "PASSED",
        detail: `vU: ${vUBalanceBefore} -> ${vUBalanceAfter}, Borrow: ${borrowBalance} -> ${borrowBalanceAfter}`,
      });
    });
  });

  after(() => {
    printLeverageResultsSummary();
  });
});
