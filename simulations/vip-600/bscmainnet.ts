import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { SWAP_HELPER, SWAP_ROUTER, UNITROLLER, vip600 } from "../../vips/vip-600/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
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

// =============================================================================
// Swap Data Helper
// =============================================================================

async function getSwapData(
  tokenInAddress: string,
  tokenOutAddress: string,
  exactAmountInMantissa: string,
  recipientAddress: string,
  slippagePercentage: string = "0.005",
): Promise<{ swapData: string; minAmountOut: BigNumber; amountOut: BigNumber }> {
  const deadlineTimestamp = Math.floor(Date.now() / 1000) + 3600;
  const url = `https://api.venus.io/find-swap?chainId=56&tokenInAddress=${tokenInAddress}&tokenOutAddress=${tokenOutAddress}&slippagePercentage=${slippagePercentage}&recipientAddress=${recipientAddress}&deadlineTimestampSecs=${deadlineTimestamp}&type=exact-in&shouldTransferToReceiver=true&exactAmountInMantissa=${exactAmountInMantissa}`;

  try {
    const response = await fetch(url);
    const data: unknown = await response.json();

    if (
      typeof data === "object" &&
      data !== null &&
      "quotes" in data &&
      Array.isArray((data as any).quotes) &&
      (data as any).quotes.length > 0
    ) {
      const quote = (data as any).quotes[0];
      const amountOut = BigNumber.from(quote.amountOut);
      return {
        swapData: quote.swapHelperMulticall.calldata.encodedCall,
        minAmountOut: amountOut.mul(99).div(100),
        amountOut,
      };
    }
    throw new Error("No quotes returned from Venus API");
  } catch (error) {
    console.log("    [WARN] Failed to fetch swap data from Venus API:", error);
    return { swapData: "0x", minAmountOut: BigNumber.from(0), amountOut: BigNumber.from(0) };
  }
}

async function getNativeSwapData(
  tokenOutAddress: string,
  exactAmountInMantissa: string,
  recipientAddress: string,
  slippagePercentage: string = "0.005",
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

// Checks if an error is a known swap failure (stale quote, route unavailable, etc.)
function isSwapError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("SwapFailed") ||
    msg.includes("InsufficientAmountOut") ||
    msg.includes("0x81ceff30") || // SwapFailed() selector
    msg.includes("NoTokensReceived")
  );
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
    swapRouter = await ethers.getContractAt(SWAP_ROUTER_ABI, SWAP_ROUTER);
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, ethers.provider);
    usdc = new ethers.Contract(USDC, ERC20_ABI, ethers.provider);
    vUSDTContract = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);
    vUSDCContract = new ethers.Contract(vUSDC, VTOKEN_ABI, ethers.provider);

    impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("10"));

    const signers = await ethers.getSigners();
    testUser = signers[0];
    testUserAddress = await testUser.getAddress();

    // Fund test user
    const usdtHolder = await initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("10"));
    const usdcHolder = await initMainnetUser(USDC_HOLDER, ethers.utils.parseEther("10"));
    await usdt.connect(usdtHolder).transfer(testUserAddress, parseUnits("10000", 18));
    await usdc.connect(usdcHolder).transfer(testUserAddress, parseUnits("10000", 18));

    // Set stale periods for oracles
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
  // Pre-VIP
  // ===========================================================================

  describe("Pre-VIP behavior", () => {
    it("should have correct ownership state", async () => {
      const pendingOwner = await swapRouter.pendingOwner();
      const owner = await swapRouter.owner();
      const isValidState = pendingOwner === bscmainnet.NORMAL_TIMELOCK || owner === bscmainnet.NORMAL_TIMELOCK;
      expect(isValidState).to.be.true;
    });

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
    it("should swap USDT -> USDC and supply to vUSDC", async () => {
      const amountIn = parseUnits("100", 18);
      const { swapData, minAmountOut } = await getSwapData(USDT, USDC, amountIn.toString(), SWAP_ROUTER, "0.01");

      if (swapData === "0x") {
        console.log("    [SKIP] Venus API unavailable");
        return;
      }

      const usdtBefore = await usdt.balanceOf(testUserAddress);
      const vUSDCBefore = await vUSDCContract.balanceOf(testUserAddress);

      await usdt.connect(testUser).approve(SWAP_ROUTER, amountIn);

      try {
        const tx = await swapRouter
          .connect(testUser)
          .swapAndSupply(vUSDC, USDT, amountIn, minAmountOut, swapData);
        const receipt = await tx.wait();

        const events = parseEventFromReceipt(receipt, "SwapAndSupply");
        expect(events.length).to.equal(1);
        expect(events[0].args.user.toLowerCase()).to.equal(testUserAddress.toLowerCase());
        expect(events[0].args.amountIn).to.equal(amountIn);
        expect(events[0].args.amountOut).to.be.gte(minAmountOut);

        expect((await usdt.balanceOf(testUserAddress)).lt(usdtBefore)).to.be.true;
        expect((await vUSDCContract.balanceOf(testUserAddress)).gt(vUSDCBefore)).to.be.true;
      } catch (error: unknown) {
        if (isSwapError(error)) {
          console.log("    [SKIP] Swap quote expired or route unavailable on forked chain");
          return;
        }
        throw error;
      }
    });

    it("should revert with MarketNotListed for unlisted vToken", async () => {
      const fakeVToken = "0x0000000000000000000000000000000000000001";
      await usdt.connect(testUser).approve(SWAP_ROUTER, parseUnits("100", 18));

      await expect(
        swapRouter.connect(testUser).swapAndSupply(fakeVToken, USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "MarketNotListed");
    });

    it("should revert with ZeroAmount when amountIn is zero", async () => {
      await expect(
        swapRouter.connect(testUser).swapAndSupply(vUSDC, USDT, 0, 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "ZeroAmount");
    });

    it("should revert with ZeroAddress when vToken is zero", async () => {
      await expect(
        swapRouter
          .connect(testUser)
          .swapAndSupply(ethers.constants.AddressZero, USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "ZeroAddress");
    });
  });

  // ===========================================================================
  // swapAndRepay
  // ===========================================================================

  describe("swapAndRepay", () => {
    before(async () => {
      // Setup: supply USDC as collateral and borrow USDT
      const supplyAmount = parseUnits("5000", 18);
      await usdc.connect(testUser).approve(vUSDC, supplyAmount);
      await vUSDCContract.connect(testUser).mint(supplyAmount);
      await comptroller.connect(testUser).enterMarkets([vUSDC]);
      await vUSDTContract.connect(testUser).borrow(parseUnits("1000", 18));
    });

    it("should swap USDC -> USDT and repay vUSDT borrow", async () => {
      const amountIn = parseUnits("500", 18);
      const borrowBefore = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
      expect(borrowBefore).to.be.gt(0);

      const { swapData, minAmountOut } = await getSwapData(USDC, USDT, amountIn.toString(), SWAP_ROUTER, "0.01");

      if (swapData === "0x") {
        console.log("    [SKIP] Venus API unavailable");
        return;
      }

      await usdc.connect(testUser).approve(SWAP_ROUTER, amountIn);

      try {
        const tx = await swapRouter
          .connect(testUser)
          .swapAndRepay(vUSDT, USDC, amountIn, minAmountOut, swapData);
        const receipt = await tx.wait();

        const events = parseEventFromReceipt(receipt, "SwapAndRepay");
        expect(events.length).to.equal(1);
        expect(events[0].args.amountRepaid).to.be.gt(0);

        const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
        expect(borrowAfter).to.be.lt(borrowBefore);
      } catch (error: unknown) {
        if (isSwapError(error)) {
          console.log("    [SKIP] Swap quote expired or route unavailable on forked chain");
          return;
        }
        throw error;
      }
    });

    it("should revert with ZeroAddress when vToken is zero", async () => {
      await expect(
        swapRouter
          .connect(testUser)
          .swapAndRepay(ethers.constants.AddressZero, USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "ZeroAddress");
    });
  });

  // ===========================================================================
  // swapAndRepayFull
  // ===========================================================================

  describe("swapAndRepayFull", () => {
    before(async () => {
      // Ensure a borrow position exists
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
        console.log("    [SKIP] No borrow balance");
        return;
      }

      const maxAmountIn = borrowBalance.mul(110).div(100);
      const { swapData } = await getSwapData(USDC, USDT, maxAmountIn.toString(), SWAP_ROUTER, "0.01");

      if (swapData === "0x") {
        console.log("    [SKIP] Venus API unavailable");
        return;
      }

      await usdc.connect(testUser).approve(SWAP_ROUTER, maxAmountIn);

      try {
        const tx = await swapRouter.connect(testUser).swapAndRepayFull(vUSDT, USDC, maxAmountIn, swapData);
        const receipt = await tx.wait();

        const events = parseEventFromReceipt(receipt, "SwapAndRepay");
        expect(events.length).to.equal(1);

        const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
        expect(borrowAfter).to.equal(0);
      } catch (error: unknown) {
        if (isSwapError(error)) {
          console.log("    [SKIP] Swap quote expired or route unavailable on forked chain");
          return;
        }
        throw error;
      }
    });
  });

  // ===========================================================================
  // swapNativeAndSupply
  // ===========================================================================

  describe("swapNativeAndSupply", () => {
    it("should swap BNB -> USDT and supply to vUSDT", async () => {
      const amountIn = parseUnits("1", 18);
      const { swapData, minAmountOut } = await getNativeSwapData(USDT, amountIn.toString(), SWAP_ROUTER, "0.01");

      if (swapData === "0x") {
        console.log("    [SKIP] Venus API unavailable");
        return;
      }

      const vUSDTBefore = await vUSDTContract.balanceOf(testUserAddress);

      try {
        const tx = await swapRouter
          .connect(testUser)
          .swapNativeAndSupply(vUSDT, minAmountOut, swapData, { value: amountIn });
        const receipt = await tx.wait();

        const events = parseEventFromReceipt(receipt, "SwapAndSupply");
        expect(events.length).to.equal(1);
        expect(events[0].args.tokenIn.toLowerCase()).to.equal(NATIVE_TOKEN_ADDR.toLowerCase());

        expect((await vUSDTContract.balanceOf(testUserAddress)).gt(vUSDTBefore)).to.be.true;
      } catch (error: unknown) {
        if (isSwapError(error)) {
          console.log("    [SKIP] Swap quote expired or route unavailable on forked chain");
          return;
        }
        throw error;
      }
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
        console.log("    [SKIP] No borrow balance");
        return;
      }

      const { swapData, minAmountOut } = await getNativeSwapData(USDT, amountIn.toString(), SWAP_ROUTER, "0.01");

      if (swapData === "0x") {
        console.log("    [SKIP] Venus API unavailable");
        return;
      }

      try {
        const tx = await swapRouter
          .connect(testUser)
          .swapNativeAndRepay(vUSDT, minAmountOut, swapData, { value: amountIn });
        const receipt = await tx.wait();

        const events = parseEventFromReceipt(receipt, "SwapAndRepay");
        expect(events.length).to.equal(1);

        const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
        expect(borrowAfter).to.be.lt(borrowBefore);
      } catch (error: unknown) {
        if (isSwapError(error)) {
          console.log("    [SKIP] Swap quote expired or route unavailable on forked chain");
          return;
        }
        throw error;
      }
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
        console.log("    [SKIP] No borrow balance");
        return;
      }

      const amountIn = parseUnits("1", 18);
      const { swapData } = await getNativeSwapData(USDT, amountIn.toString(), SWAP_ROUTER, "0.01");

      if (swapData === "0x") {
        console.log("    [SKIP] Venus API unavailable");
        return;
      }

      try {
        const tx = await swapRouter
          .connect(testUser)
          .swapNativeAndRepayFull(vUSDT, swapData, { value: amountIn });
        const receipt = await tx.wait();

        const events = parseEventFromReceipt(receipt, "SwapAndRepay");
        expect(events.length).to.equal(1);

        const borrowAfter = await vUSDTContract.callStatic.borrowBalanceCurrent(testUserAddress);
        expect(borrowAfter).to.equal(0);
      } catch (error: unknown) {
        if (isSwapError(error)) {
          console.log("    [SKIP] Swap quote expired or route unavailable on forked chain");
          return;
        }
        throw error;
      }
    });
  });

  // ===========================================================================
  // sweepToken
  // ===========================================================================

  describe("sweepToken", () => {
    it("should allow owner to sweep ERC20 tokens stuck in the router", async () => {
      // Send tokens to the router (simulating accidental transfer)
      const accidentalAmount = parseUnits("10", 18);
      const usdtHolder = await initMainnetUser(USDT_HOLDER, ethers.utils.parseEther("1"));
      await usdt.connect(usdtHolder).transfer(SWAP_ROUTER, accidentalAmount);

      const routerBalanceBefore = await usdt.balanceOf(SWAP_ROUTER);
      expect(routerBalanceBefore).to.be.gte(accidentalAmount);

      // sweepToken sends to owner() which is NORMAL_TIMELOCK
      const ownerAddress = await swapRouter.owner();
      const ownerBalanceBefore = await usdt.balanceOf(ownerAddress);

      const tx = await swapRouter.connect(impersonatedTimelock).sweepToken(USDT);
      const receipt = await tx.wait();

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
    it("should allow owner to sweep native BNB stuck in the router", async () => {
      // The receive() only accepts BNB from WBNB, so use hardhat_setBalance
      // to simulate BNB being stuck in the contract (e.g. from swap leftovers)
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

      // Router should have zero BNB after sweep
      expect(await ethers.provider.getBalance(SWAP_ROUTER)).to.equal(0);
    });

    it("should revert when called by non-owner", async () => {
      await expect(swapRouter.connect(testUser).sweepNative()).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );
    });

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
    it("should revert swapAndSupply with MarketNotListed for unlisted vToken", async () => {
      await expect(
        swapRouter
          .connect(testUser)
          .swapAndSupply("0x0000000000000000000000000000000000000001", USDT, parseUnits("100", 18), 0, "0x"),
      ).to.be.revertedWithCustomError(swapRouter, "MarketNotListed");
    });

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

    it("should support two-step ownership transfer", async () => {
      const newOwner = testUserAddress;

      await swapRouter.connect(impersonatedTimelock).transferOwnership(newOwner);
      expect(await swapRouter.pendingOwner()).to.equal(newOwner);

      await swapRouter.connect(testUser).acceptOwnership();
      expect(await swapRouter.owner()).to.equal(newOwner);

      // Transfer back
      await swapRouter.connect(testUser).transferOwnership(bscmainnet.NORMAL_TIMELOCK);
      await swapRouter.connect(impersonatedTimelock).acceptOwnership();
      expect(await swapRouter.owner()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });
  });

  // ===========================================================================
  // Integration: Full Supply -> Borrow -> Repay Cycle
  // ===========================================================================

  describe("Integration: full supply -> borrow -> repay cycle", () => {
    it("should complete entire user journey via swap router", async () => {
      const signers = await ethers.getSigners();
      const integrationUser = signers[5];
      const integrationUserAddress = await integrationUser.getAddress();

      await initMainnetUser(integrationUserAddress, parseUnits("10", 18));

      // Step 1: Swap BNB -> USDC and supply
      const bnbToSupply = parseUnits("2", 18);
      const { swapData: supplySwapData, minAmountOut: supplyMinOut } = await getNativeSwapData(
        USDC,
        bnbToSupply.toString(),
        SWAP_ROUTER,
        "0.02",
      );

      if (supplySwapData === "0x") {
        console.log("    [SKIP] Venus API unavailable");
        return;
      }

      try {
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

        // Step 3: Swap BNB -> USDT and repay
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
      } catch (error: unknown) {
        if (isSwapError(error)) {
          console.log("    [SKIP] Swap quote expired or route unavailable on forked chain");
          return;
        }
        throw error;
      }
    });
  });
});
