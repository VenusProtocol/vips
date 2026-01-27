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
// Manual Swap Calldata Builder (builds against forked chain state)
// =============================================================================

// Shared signer wallet for EIP-712 signing — set up once in before() hook
let swapSignerWallet: Wallet;
let swapHelperContract: Contract;
let eip712Domain: { name: string; version: string; chainId: number; verifyingContract: string };
let saltCounter = 0;

/**
 * Configures a deterministic EIP-712 signer for the SwapHelper contract on the forked chain.
 *
 * In production, the SwapHelper requires a backend signer to authorize multicall executions
 * via EIP-712 signatures. In tests, we:
 * 1. Create a deterministic Hardhat wallet (using Hardhat's default private key)
 * 2. Impersonate the SwapHelper owner to register this wallet as the authorized backendSigner
 * 3. Cache the EIP-712 domain parameters (name, version, chainId, verifyingContract) for later signing
 *
 * This must be called once in the before() hook before any swap tests that need signed calldata.
 */
async function setupSwapSigner() {
  // Create a deterministic wallet for signing
  swapSignerWallet = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", ethers.provider);

  swapHelperContract = new ethers.Contract(SWAP_HELPER, SWAP_HELPER_ABI, ethers.provider);

  // Impersonate SwapHelper owner and set our wallet as backendSigner
  const swapHelperOwner = await swapHelperContract.owner();
  const impersonatedOwner = await initMainnetUser(swapHelperOwner, ethers.utils.parseEther("1"));
  await swapHelperContract.connect(impersonatedOwner).setBackendSigner(swapSignerWallet.address);

  // Read EIP-712 domain — use the actual chainId from the network (hardhat fork uses 31337, not 56)
  const domain = await swapHelperContract.eip712Domain();
  const network = await ethers.provider.getNetwork();
  eip712Domain = {
    name: domain.name,
    version: domain.version,
    chainId: network.chainId,
    verifyingContract: domain.verifyingContract,
  };
}

/**
 * Builds the full signed SwapHelper multicall calldata for a PancakeSwap V2 token swap.
 *
 * This function simulates what the backend swap service does in production:
 * 1. Queries PancakeSwap V2 for the expected output amount (tries direct pair, falls back to WBNB route)
 * 2. Applies slippage tolerance to compute minAmountOut
 * 3. Encodes a 3-step SwapHelper multicall:
 *    a. approveMax — approve PancakeSwap router to spend tokenIn held by SwapHelper
 *    b. genericCall — execute swapExactTokensForTokens on PancakeSwap, receiving tokens to SwapHelper
 *    c. sweep — transfer the swapped tokens from SwapHelper to the recipient (SwapRouter)
 * 4. Signs the multicall with EIP-712 using the test backend signer wallet
 * 5. Returns the encoded multicall calldata ready to pass to SwapRouter functions
 *
 * @param tokenIn - Address of the input token (use NATIVE_TOKEN_ADDR for BNB)
 * @param tokenOut - Address of the desired output token
 * @param amountIn - Exact amount of tokenIn to swap (in wei/mantissa)
 * @param recipient - Address to receive swapped tokens (typically SWAP_ROUTER)
 * @param slippageBps - Slippage tolerance in basis points (default: 100 = 1%)
 * @returns swapData (encoded multicall bytes), minAmountOut, and expected amountOut
 */
async function buildSwapCalldata(
  tokenIn: string,
  tokenOut: string,
  amountIn: BigNumber,
  recipient: string,
  slippageBps: number = 100, // 1% default
): Promise<{ swapData: string; minAmountOut: BigNumber; amountOut: BigNumber }> {
  const pancakeRouter = new ethers.Contract(PANCAKE_V2_ROUTER, PANCAKE_V2_ROUTER_ABI, ethers.provider);

  // For native swaps, the actual tokenIn on the DEX is WBNB
  const actualTokenIn = tokenIn.toLowerCase() === NATIVE_TOKEN_ADDR.toLowerCase() ? WBNB : tokenIn;

  // Build path — direct pair or via WBNB
  let path: string[];
  let amounts: BigNumber[];

  try {
    // Try direct path first
    path = [actualTokenIn, tokenOut];
    amounts = await pancakeRouter.getAmountsOut(amountIn, path);
  } catch {
    // If direct path fails, route via WBNB
    if (actualTokenIn !== WBNB && tokenOut !== WBNB) {
      path = [actualTokenIn, WBNB, tokenOut];
      amounts = await pancakeRouter.getAmountsOut(amountIn, path);
    } else {
      throw new Error(`No route found for ${tokenIn} -> ${tokenOut}`);
    }
  }

  const amountOut = amounts[amounts.length - 1];
  const minAmountOut = amountOut.mul(10000 - slippageBps).div(10000);

  // Build the SwapHelper multicall calls array
  const swapHelperIface = new ethers.utils.Interface(SWAP_HELPER_ABI);

  // 1. approveMax(tokenIn, PancakeRouter) — let SwapHelper approve the DEX
  const approveCall = swapHelperIface.encodeFunctionData("approveMax", [actualTokenIn, PANCAKE_V2_ROUTER]);

  // 2. genericCall(PancakeRouter, swapExactTokensForTokens(...))
  const pancakeIface = new ethers.utils.Interface(PANCAKE_V2_ROUTER_ABI);
  const deadline = Math.floor(Date.now() / 1000) + 3600;
  const swapCalldata = pancakeIface.encodeFunctionData("swapExactTokensForTokens", [
    amountIn,
    minAmountOut,
    path,
    SWAP_HELPER, // tokens go to SwapHelper first
    deadline,
  ]);
  const genericCall = swapHelperIface.encodeFunctionData("genericCall", [PANCAKE_V2_ROUTER, swapCalldata]);

  // 3. sweep(tokenOut, recipient) — send swapped tokens to SwapRouter
  const sweepCall = swapHelperIface.encodeFunctionData("sweep", [tokenOut, recipient]);

  const calls = [approveCall, genericCall, sweepCall];

  // EIP-712 sign — type includes "address caller" which is msg.sender (SwapRouter)
  const salt = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(["uint256"], [++saltCounter]));

  const types = {
    Multicall: [
      { name: "caller", type: "address" },
      { name: "calls", type: "bytes[]" },
      { name: "deadline", type: "uint256" },
      { name: "salt", type: "bytes32" },
    ],
  };

  const value = {
    caller: SWAP_ROUTER,
    calls,
    deadline,
    salt,
  };

  const signature = await swapSignerWallet._signTypedData(eip712Domain, types, value);

  // Encode the full multicall call
  const multicallData = swapHelperIface.encodeFunctionData("multicall", [calls, deadline, salt, signature]);

  return { swapData: multicallData, minAmountOut, amountOut };
}

/**
 * High-level wrapper around buildSwapCalldata that accepts string-based parameters
 * matching the interface used by test cases. Converts the slippage percentage (e.g. "0.01"
 * for 1%) to basis points and the amount string to BigNumber before delegating.
 *
 * @param tokenInAddress - Address of the input token
 * @param tokenOutAddress - Address of the desired output token
 * @param exactAmountInMantissa - Input amount as a string (in wei/mantissa)
 * @param recipientAddress - Address to receive swapped tokens
 * @param slippagePercentage - Slippage as a decimal string (e.g. "0.01" = 1%)
 */
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

/**
 * Convenience wrapper for native BNB swaps. Sets tokenIn to the sentinel NATIVE_TOKEN_ADDR
 * (0xbBbB...bBbB) which buildSwapCalldata translates to WBNB for the actual DEX swap.
 * Used by swapNativeAndSupply, swapNativeAndRepay, and swapNativeAndRepayFull tests.
 *
 * @param tokenOutAddress - Address of the desired output token
 * @param exactAmountInMantissa - BNB amount as a string (in wei)
 * @param recipientAddress - Address to receive swapped tokens
 * @param slippagePercentage - Slippage as a decimal string (e.g. "0.01" = 1%)
 */
async function getNativeSwapData(
  tokenOutAddress: string,
  exactAmountInMantissa: string,
  recipientAddress: string,
  slippagePercentage: string = "0.01",
): Promise<{ swapData: string; minAmountOut: BigNumber; amountOut: BigNumber }> {
  return getSwapData(NATIVE_TOKEN_ADDR, tokenOutAddress, exactAmountInMantissa, recipientAddress, slippagePercentage);
}

// =============================================================================
// Helpers: Event Parsing
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

// Fork BSC mainnet at a specific block to get deterministic test results.
// All tests run against this snapshot, with the VIP executed mid-suite via testVip().
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
    // Initialize contract instances for the SwapRouter, Comptroller, tokens, and vTokens
    swapRouter = await ethers.getContractAt(SWAP_ROUTER_ABI, SWAP_ROUTER);
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    vUSDTContract = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);
    vUSDCContract = new ethers.Contract(vUSDC, VTOKEN_ABI, ethers.provider);

    // Impersonate the timelock to execute owner-only functions (sweepToken, transferOwnership, etc.)
    impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("10"));

    const signers = await ethers.getSigners();
    testUser = signers[0];
    testUserAddress = await testUser.getAddress();

    // Fund the test user with 10,000 USDT and 10,000 USDC from whale accounts
    // so they have enough tokens for all swap and supply/repay tests
    const usdtHolder = await initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("10"));
    const usdcHolder = await initMainnetUser(USDC_HOLDER, ethers.utils.parseEther("10"));
    await usdt.connect(usdtHolder).transfer(testUserAddress, parseUnits("10000", 18));
    await usdc.connect(usdcHolder).transfer(testUserAddress, parseUnits("10000", 18));

    // Set oracle stale periods to ~10 years so price feeds don't revert as "stale"
    // on the forked chain (block timestamps are in the past relative to real time)
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

    // Setup the EIP-712 swap signer so we can build signed multicall calldata
    // for PancakeSwap swaps routed through the SwapHelper contract
    await setupSwapSigner();
  });

  // ===========================================================================
  // Pre-VIP
  // ===========================================================================

  describe("Pre-VIP behavior", () => {
    // Verify that before the VIP is executed, the SwapRouter either already has
    // NORMAL_TIMELOCK as owner or has it set as pendingOwner (awaiting acceptOwnership).
    it("should have correct ownership state", async () => {
      const pendingOwner = await swapRouter.pendingOwner();
      const owner = await swapRouter.owner();
      const isValidState = pendingOwner === bscmainnet.NORMAL_TIMELOCK || owner === bscmainnet.NORMAL_TIMELOCK;
      expect(isValidState).to.be.true;
    });

    // Validate all immutable constructor parameters were set correctly during deployment.
    // These cannot be changed after deployment, so we confirm them before VIP execution.
    it("should have correct COMPTROLLER", async () => {
      expect(await swapRouter.COMPTROLLER()).to.equal(UNITROLLER);
    });

    it("should have correct SWAP_HELPER", async () => {
      expect(await swapRouter.SWAP_HELPER()).to.equal(SWAP_HELPER);
    });

    it("should have correct WRAPPED_NATIVE (WBNB)", async () => {
      expect(await swapRouter.WRAPPED_NATIVE()).to.equal(WBNB);
    });

    it("should have correct NATIVE_VTOKEN (vBNB)", async () => {
      expect(await swapRouter.NATIVE_VTOKEN()).to.equal(vBNB);
    });

    it("should have correct NATIVE_TOKEN_ADDR", async () => {
      expect(await swapRouter.NATIVE_TOKEN_ADDR()).to.equal(NATIVE_TOKEN_ADDR);
    });
  });

  // ===========================================================================
  // VIP Execution
  // ===========================================================================

  // Execute the VIP proposal on the forked chain. After execution, verify that
  // at most one OwnershipTransferred event was emitted (the acceptOwnership call).
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
    // After VIP execution, ownership should be fully transferred to NORMAL_TIMELOCK
    // and pendingOwner should be cleared (zero address), confirming acceptOwnership succeeded.
    it("should have NORMAL_TIMELOCK as owner", async () => {
      expect(await swapRouter.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("should have zero address as pending owner", async () => {
      expect(await swapRouter.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  // ===========================================================================
  // swapAndSupply
  // ===========================================================================

  describe("swapAndSupply", () => {
    // Happy path: User swaps 100 USDT for USDC via PancakeSwap, then the router
    // automatically supplies the received USDC into the vUSDC market on behalf of the user.
    // Verifies: SwapAndSupply event emitted, USDT balance decreased, vUSDC balance increased.
    it("should swap USDT -> USDC and supply to vUSDC", async () => {
      const amountIn = parseUnits("100", 18);
      // Build swap calldata: USDT -> USDC via PancakeSwap V2, with 1% slippage tolerance
      const { swapData, minAmountOut } = await getSwapData(USDT, USDC, amountIn.toString(), SWAP_ROUTER, "0.01");

      const usdtBefore = await usdt.balanceOf(testUserAddress);
      const vUSDCBefore = await vUSDCContract.balanceOf(testUserAddress);

      // Approve the SwapRouter to pull USDT from the user
      await usdt.connect(testUser).approve(SWAP_ROUTER, amountIn);

      const tx = await swapRouter.connect(testUser).swapAndSupply(vUSDC, USDT, amountIn, minAmountOut, swapData);
      const receipt = await tx.wait();

      // Verify the SwapAndSupply event contains the correct user, input amount, and output >= minAmountOut
      const events = parseEventFromReceipt(receipt, "SwapAndSupply");
      expect(events.length).to.equal(1);
      expect(events[0].args.user.toLowerCase()).to.equal(testUserAddress.toLowerCase());
      expect(events[0].args.amountIn).to.equal(amountIn);
      expect(events[0].args.amountOut).to.be.gte(minAmountOut);

      // Confirm token balances changed: USDT spent, vUSDC (supply receipt tokens) received
      expect((await usdt.balanceOf(testUserAddress)).lt(usdtBefore)).to.be.true;
      expect((await vUSDCContract.balanceOf(testUserAddress)).gt(vUSDCBefore)).to.be.true;
    });

    // Supplying to a vToken that isn't listed in the Comptroller should revert
    it("should revert with MarketNotListed for unlisted vToken", async () => {
      const fakeVToken = "0x0000000000000000000000000000000000000001";
      await usdt.connect(testUser).approve(SWAP_ROUTER, parseUnits("100", 18));

      await expect(
        swapRouter.connect(testUser).swapAndSupply(fakeVToken, USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "MarketNotListed");
    });

    // Zero input amount is rejected to prevent no-op transactions
    it("should revert with ZeroAmount when amountIn is zero", async () => {
      await expect(swapRouter.connect(testUser).swapAndSupply(vUSDC, USDT, 0, 0, "0x")).to.be.revertedWithCustomError(
        swapRouter,
        "ZeroAmount",
      );
    });

    // Zero address for vToken is rejected as an input validation check
    it("should revert with ZeroAddress when vToken is zero", async () => {
      await expect(
        swapRouter.connect(testUser).swapAndSupply(ethers.constants.AddressZero, USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "ZeroAddress");
    });
  });

  // ===========================================================================
  // swapAndRepay
  // ===========================================================================

  describe("swapAndRepay", () => {
    before(async () => {
      // Create a borrow position: supply 5000 USDC as collateral, enter the market,
      // then borrow 1000 USDT against it. This sets up the state needed for repay tests.
      const supplyAmount = parseUnits("5000", 18);
      await usdc.connect(testUser).approve(vUSDC, supplyAmount);
      await vUSDCContract.connect(testUser).mint(supplyAmount);
      await comptroller.connect(testUser).enterMarkets([vUSDC]);
      await vUSDTContract.connect(testUser).borrow(parseUnits("1000", 18));
    });

    // Happy path: User swaps 500 USDC for USDT, and the router uses the received USDT
    // to repay part of the user's outstanding vUSDT borrow. Confirms borrow balance decreased.
    it("should swap USDC -> USDT and repay vUSDT borrow", async () => {
      const amountIn = parseUnits("500", 18);
      const borrowBefore = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      expect(borrowBefore).to.be.gt(0);

      const { swapData, minAmountOut } = await getSwapData(USDC, USDT, amountIn.toString(), SWAP_ROUTER, "0.01");

      await usdc.connect(testUser).approve(SWAP_ROUTER, amountIn);

      const tx = await swapRouter.connect(testUser).swapAndRepay(vUSDT, USDC, amountIn, minAmountOut, swapData);
      const receipt = await tx.wait();

      // Verify SwapAndRepay event was emitted with a non-zero repaid amount
      const events = parseEventFromReceipt(receipt, "SwapAndRepay");
      expect(events.length).to.equal(1);
      expect(events[0].args.amountRepaid).to.be.gt(0);

      // Borrow balance should have decreased after partial repayment
      const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      expect(borrowAfter).to.be.lt(borrowBefore);
    });

    it("should revert with ZeroAddress when vToken is zero", async () => {
      await expect(
        swapRouter.connect(testUser).swapAndRepay(ethers.constants.AddressZero, USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "ZeroAddress");
    });
  });

  // ===========================================================================
  // swapAndRepayFull
  // ===========================================================================

  describe("swapAndRepayFull", () => {
    before(async () => {
      // Ensure a borrow position exists; if previous tests fully repaid, re-borrow
      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      if (borrowBalance.eq(0)) {
        const supplyAmount = parseUnits("2000", 18);
        await usdc.connect(testUser).approve(vUSDC, supplyAmount);
        await vUSDCContract.connect(testUser).mint(supplyAmount);
        await vUSDTContract.connect(testUser).borrow(parseUnits("500", 18));
      }
    });

    // Full repayment: swaps enough USDC -> USDT to cover the entire outstanding borrow.
    // Uses 110% of borrow balance as maxAmountIn to account for swap slippage and accrued interest.
    // The router repays only what's owed and refunds any excess tokens back to the user.
    // After execution, borrow balance should be exactly zero.
    it("should swap USDC -> USDT and fully repay vUSDT borrow", async () => {
      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      if (borrowBalance.eq(0)) {
        console.log("    [SKIP] No borrow balance");
        return;
      }

      // Provide 10% buffer over borrow balance to cover slippage and accrued interest
      const maxAmountIn = borrowBalance.mul(110).div(100);
      const { swapData } = await getSwapData(USDC, USDT, maxAmountIn.toString(), SWAP_ROUTER, "0.01");

      await usdc.connect(testUser).approve(SWAP_ROUTER, maxAmountIn);

      const tx = await swapRouter.connect(testUser).swapAndRepayFull(vUSDT, USDC, maxAmountIn, swapData);
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SwapAndRepay");
      expect(events.length).to.equal(1);

      // Borrow balance should be fully cleared
      const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      expect(borrowAfter).to.equal(0);
    });
  });

  // ===========================================================================
  // swapNativeAndSupply
  // ===========================================================================

  describe("swapNativeAndSupply", () => {
    // Happy path: User sends 1 BNB which the router wraps to WBNB, swaps to USDT
    // via PancakeSwap, then supplies the USDT into the vUSDT market for the user.
    // The event reports WBNB as tokenIn since the router wraps before swapping.
    it("should swap BNB -> USDT and supply to vUSDT", async () => {
      const amountIn = parseUnits("1", 18);
      const { swapData, minAmountOut } = await getNativeSwapData(USDT, amountIn.toString(), SWAP_ROUTER, "0.01");

      const vUSDTBefore = await vUSDTContract.balanceOf(testUserAddress);

      // Send BNB as msg.value; the router handles wrapping to WBNB internally
      const tx = await swapRouter
        .connect(testUser)
        .swapNativeAndSupply(vUSDT, minAmountOut, swapData, { value: amountIn });
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SwapAndSupply");
      expect(events.length).to.equal(1);
      // SwapRouter wraps BNB to WBNB before swapping, so tokenIn in the event is WBNB
      expect(events[0].args.tokenIn.toLowerCase()).to.equal(WBNB.toLowerCase());

      // User should have received vUSDT tokens representing their supply position
      expect((await vUSDTContract.balanceOf(testUserAddress)).gt(vUSDTBefore)).to.be.true;
    });
  });

  // ===========================================================================
  // swapNativeAndRepay
  // ===========================================================================

  describe("swapNativeAndRepay", () => {
    before(async () => {
      // Ensure a borrow position exists for the repay test
      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      if (borrowBalance.eq(0)) {
        const supplyAmount = parseUnits("2000", 18);
        await usdc.connect(testUser).approve(vUSDC, supplyAmount);
        await vUSDCContract.connect(testUser).mint(supplyAmount);
        await vUSDTContract.connect(testUser).borrow(parseUnits("500", 18));
      }
    });

    // Partial repayment using native BNB: sends 0.5 BNB which is wrapped to WBNB,
    // swapped to USDT, and used to partially repay the user's vUSDT borrow position.
    it("should swap BNB -> USDT and repay vUSDT borrow", async () => {
      const amountIn = parseUnits("0.5", 18);
      const borrowBefore = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);

      if (borrowBefore.eq(0)) {
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

      // Borrow balance should have decreased after partial repayment with native BNB
      const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      expect(borrowAfter).to.be.lt(borrowBefore);
    });
  });

  // ===========================================================================
  // swapNativeAndRepayFull
  // ===========================================================================

  describe("swapNativeAndRepayFull", () => {
    before(async () => {
      // Ensure a borrow position exists for the full repay test
      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      if (borrowBalance.eq(0)) {
        const supplyAmount = parseUnits("1000", 18);
        await usdc.connect(testUser).approve(vUSDC, supplyAmount);
        await vUSDCContract.connect(testUser).mint(supplyAmount);
        await vUSDTContract.connect(testUser).borrow(parseUnits("100", 18));
      }
    });

    // Full repayment using native BNB: sends 1 BNB (more than enough to cover the ~100 USDT borrow).
    // The router wraps BNB -> WBNB, swaps to USDT, repays the exact borrow amount,
    // and refunds any excess tokens. Borrow balance should be zero after execution.
    it("should swap BNB -> USDT and fully repay vUSDT borrow", async () => {
      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      if (borrowBalance.eq(0)) {
        console.log("    [SKIP] No borrow balance");
        return;
      }

      // Send more BNB than needed; the router handles exact repayment and refunds excess
      const amountIn = parseUnits("1", 18);
      const { swapData } = await getNativeSwapData(USDT, amountIn.toString(), SWAP_ROUTER, "0.01");

      const tx = await swapRouter.connect(testUser).swapNativeAndRepayFull(vUSDT, swapData, { value: amountIn });
      const receipt = await tx.wait();

      const events = parseEventFromReceipt(receipt, "SwapAndRepay");
      expect(events.length).to.equal(1);

      // Borrow should be fully cleared
      const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      expect(borrowAfter).to.equal(0);
    });
  });

  // ===========================================================================
  // sweepToken
  // ===========================================================================

  describe("sweepToken", () => {
    // Recovery mechanism: if ERC20 tokens are accidentally sent directly to the router
    // (not via a swap), the owner can sweep them out. This simulates an accidental
    // transfer of 10 USDT to the router, then the owner recovers them.
    it("should allow owner to sweep ERC20 tokens stuck in the router", async () => {
      // Simulate accidental token transfer to the router contract
      const accidentalAmount = parseUnits("10", 18);
      const usdtHolder = await initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("1"));
      await usdt.connect(usdtHolder).transfer(SWAP_ROUTER, accidentalAmount);

      const routerBalanceBefore = await usdt.balanceOf(SWAP_ROUTER);
      expect(routerBalanceBefore).to.be.gte(accidentalAmount);

      // sweepToken transfers the entire token balance to the owner (NORMAL_TIMELOCK)
      const ownerAddress = await swapRouter.owner();
      const ownerBalanceBefore = await usdt.balanceOf(ownerAddress);

      const tx = await swapRouter.connect(impersonatedTimelock).sweepToken(USDT);
      const receipt = await tx.wait();

      // Verify SweepToken event reports the correct token and full amount swept
      const events = parseEventFromReceipt(receipt, "SweepToken");
      expect(events.length).to.equal(1);
      expect(events[0].args.token.toLowerCase()).to.equal(USDT.toLowerCase());
      expect(events[0].args.amount).to.equal(routerBalanceBefore);

      // Router balance should be zero after sweep
      expect(await usdt.balanceOf(SWAP_ROUTER)).to.equal(0);

      // Owner should have received the tokens
      const ownerBalanceAfter = await usdt.balanceOf(ownerAddress);
      expect(ownerBalanceAfter.sub(ownerBalanceBefore)).to.equal(routerBalanceBefore);
    });

    // Only the owner (NORMAL_TIMELOCK) can sweep; regular users cannot drain the router
    it("should revert when called by non-owner", async () => {
      await expect(swapRouter.connect(testUser).sweepToken(USDT)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });
  });

  // ===========================================================================
  // sweepNative
  // ===========================================================================

  describe("sweepNative", () => {
    // Recovery mechanism for native BNB stuck in the router (e.g. leftover from WBNB unwrapping).
    // Since receive() only accepts BNB from WBNB, we use hardhat_setBalance to force BNB into the contract.
    it("should allow owner to sweep native BNB stuck in the router", async () => {
      // Force 0.1 BNB into the router via hardhat cheatcode (can't send directly due to receive() guard)
      const forcedAmount = parseUnits("0.1", 18);
      await ethers.provider.send("hardhat_setBalance", [
        SWAP_ROUTER,
        ethers.utils.hexStripZeros(forcedAmount.toHexString()),
      ]);

      const routerBalance = await ethers.provider.getBalance(SWAP_ROUTER);
      expect(routerBalance).to.be.gt(0);

      const tx = await swapRouter.connect(impersonatedTimelock).sweepNative();
      const receipt = await tx.wait();

      // Verify SweepNative event reports the full amount swept to the owner
      const events = parseEventFromReceipt(receipt, "SweepNative");
      expect(events.length).to.equal(1);
      expect(events[0].args.amount).to.equal(routerBalance);

      // Router should have zero BNB after sweep
      expect(await ethers.provider.getBalance(SWAP_ROUTER)).to.equal(0);
    });

    // Only the owner can sweep native BNB
    it("should revert when called by non-owner", async () => {
      await expect(swapRouter.connect(testUser).sweepNative()).to.be.revertedWith("Ownable: caller is not the owner");
    });

    // The router's receive() function only accepts BNB from WBNB (during unwrap).
    // Direct BNB transfers from any other address are rejected to prevent accidental sends.
    it("should revert when non-WBNB address sends BNB directly", async () => {
      await expect(
        testUser.sendTransaction({ to: SWAP_ROUTER, value: parseUnits("0.1", 18) }),
      ).to.be.revertedWithCustomError(swapRouter, "UnauthorizedNativeSender");
    });
  });

  // ===========================================================================
  // Error Cases
  // ===========================================================================

  describe("Error cases", () => {
    // Attempting to supply into a market that isn't registered in the Comptroller should fail
    it("should revert swapAndSupply with MarketNotListed for unlisted vToken", async () => {
      await expect(
        swapRouter
          .connect(testUser)
          .swapAndSupply("0x0000000000000000000000000000000000000001", USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "MarketNotListed");
    });

    // Passing garbage swap calldata (0xdeadbeef) causes the SwapHelper multicall to fail,
    // which the router surfaces as a SwapFailed error
    it("should revert swapAndSupply with SwapFailed for invalid swap data", async () => {
      await usdt.connect(testUser).approve(SWAP_ROUTER, parseUnits("100", 18));

      await expect(
        swapRouter.connect(testUser).swapAndSupply(vUSDC, USDT, parseUnits("100", 18), 0, "0xdeadbeef"),
      ).to.be.revertedWithCustomError(swapRouter, "SwapFailed");
    });
  });

  // ===========================================================================
  // Ownership
  // ===========================================================================

  describe("Ownership", () => {
    it("should have correct owner after VIP execution", async () => {
      expect(await swapRouter.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    // Two-step ownership transfer (Ownable2Step pattern):
    // 1. Current owner calls transferOwnership(newOwner) -> sets pendingOwner
    // 2. New owner calls acceptOwnership() -> becomes owner, pendingOwner cleared
    // This prevents accidental transfers to wrong addresses (new owner must actively accept).
    // After verifying the flow, ownership is transferred back to NORMAL_TIMELOCK for subsequent tests.
    it("should support two-step ownership transfer", async () => {
      const newOwner = testUserAddress;

      // Step 1: Current owner proposes new owner
      await swapRouter.connect(impersonatedTimelock).transferOwnership(newOwner);
      expect(await swapRouter.pendingOwner()).to.equal(newOwner);

      // Step 2: New owner accepts
      await swapRouter.connect(testUser).acceptOwnership();
      expect(await swapRouter.owner()).to.equal(newOwner);

      // Cleanup: Transfer ownership back to NORMAL_TIMELOCK so other tests aren't affected
      await swapRouter.connect(testUser).transferOwnership(bscmainnet.NORMAL_TIMELOCK);
      await swapRouter.connect(impersonatedTimelock).acceptOwnership();
      expect(await swapRouter.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });
  });

  // ===========================================================================
  // Integration: Full Supply -> Borrow -> Repay Cycle
  // ===========================================================================

  // End-to-end integration test simulating a realistic user journey through the swap router:
  // 1. A fresh user swaps BNB -> USDC and supplies it as collateral via swapNativeAndSupply
  // 2. The user enters the USDC market and borrows USDT against their collateral
  // 3. The user swaps BNB -> USDT and partially repays the borrow via swapNativeAndRepay
  // This validates that all swap router functions work together in a real lending workflow.
  describe("Integration: full supply -> borrow -> repay cycle", () => {
    it("should complete entire user journey via swap router", async () => {
      // Use a separate signer (signers[5]) to start with a clean slate — no prior positions
      const signers = await ethers.getSigners();
      const integrationUser = signers[5];
      const integrationUserAddress = await integrationUser.getAddress();

      await initMainnetUser(integrationUserAddress, parseUnits("10", 18));

      // Step 1: Swap 2 BNB -> USDC and supply to vUSDC (creates collateral position)
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

      // Step 2: Enter the USDC market as collateral and borrow 100 USDT against it
      await comptroller.connect(integrationUser).enterMarkets([vUSDC]);
      await vUSDTContract.connect(integrationUser).borrow(parseUnits("100", 18));

      const borrowBalance = await vUSDTContract.callStatic.borrowBalanceCurrent(integrationUserAddress);
      expect(borrowBalance).to.be.gt(0);

      // Step 3: Swap 0.5 BNB -> USDT and use it to partially repay the borrow
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

      // Confirm borrow balance decreased after partial repayment
      const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(integrationUserAddress);
      expect(borrowAfter).to.be.lt(borrowBalance);
    });
  });
});
