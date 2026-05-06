import { TransactionResponse } from "@ethersproject/providers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  pinResilientOraclePriceViaRedstone,
  setMaxStalePeriod,
  setMaxStalePeriodForAllAssets,
} from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";
import CHAINLINK_ORACLE_ABI from "src/vip-framework/abi/chainlinkOracle.json";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import VTOKEN_ABI from "src/vip-framework/abi/vToken.json";

import vip665, { ASSET_CONFIGS } from "../../vips/vip-665/bscmainnet";
import vip666, { ASSETS_TO_ENABLE, DEVIATION_BOUNDED_ORACLE } from "../../vips/vip-666/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const { NORMAL_TIMELOCK, GUARDIAN, UNITROLLER } = bscmainnet;

const FORK_BLOCK = 96687252;

const SUPPORTER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";

const findAssetConfig = (name: string): { asset: string; vToken: string } => {
  const cfg = ASSET_CONFIGS.find(c => c.name === name);
  if (!cfg) throw new Error(`Asset "${name}" not present in vip-665 asset-configs`);
  return { asset: cfg.asset, vToken: cfg.vToken };
};

const TRX = findAssetConfig("TRX");
const ETH = findAssetConfig("ETH");

type Signer = Awaited<ReturnType<typeof initMainnetUser>>;

forking(FORK_BLOCK, async () => {
  const provider = ethers.provider;

  let dbo: Contract;
  let resilient: Contract;
  let comptroller: Contract;

  before(async () => {
    dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, provider);
    resilient = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);

    const assetContracts = await Promise.all(ASSET_CONFIGS.map(c => ethers.getContractAt(ERC20_ABI, c.asset)));
    await setMaxStalePeriodForAllAssets(resilient, assetContracts);

    // SolvBTC, xSolvBTC, and TWT use feeds that enforce their own internal
    // staleness window.
    for (const a of ["SolvBTC", "xSolvBTC", "TWT"]) {
      const cfg = findAssetConfig(a);
      await pinResilientOraclePriceViaRedstone(resilient, cfg.asset);
    }

    // Replay VIP-665 so the fork sees the post-665 state (DBO wired, ACM
    // granted, 24 assets seeded, only TRX enabled).
    await pretendExecutingVip(await vip665(), NORMAL_TIMELOCK);
  });

  // ────────────────────────────────────────────────────────────────────
  // Pre-VIP state
  // ────────────────────────────────────────────────────────────────────
  describe("Pre-VIP state", () => {
    it("23 target assets have isBoundedPricingEnabled === false", async () => {
      for (const c of ASSETS_TO_ENABLE) {
        expect(await dbo.isBoundedPricingEnabled(c.asset), `${c.name}.isBoundedPricingEnabled`).to.equal(false);
      }
    });

    it("TRX is the only asset currently enabled", async () => {
      expect(await dbo.isBoundedPricingEnabled(TRX.asset)).to.equal(true);
      const enabled: string[] = await dbo.getAllBoundedPricingEnabledAssets();
      expect(enabled.length).to.equal(1);
      expect(enabled[0].toLowerCase()).to.equal(TRX.asset.toLowerCase());
    });

    it("each disabled asset has window seeded at spot (minPrice == maxPrice == spot)", async () => {
      for (const c of ASSETS_TO_ENABLE) {
        const spot: BigNumber = await resilient.getPrice(c.asset);
        const cfg = await dbo.assetProtectionConfig(c.asset);
        expect(cfg.minPrice, `${c.name}.minPrice`).to.equal(spot);
        expect(cfg.maxPrice, `${c.name}.maxPrice`).to.equal(spot);
        expect(cfg.currentlyUsingProtectedPrice, `${c.name}.currentlyUsingProtectedPrice`).to.equal(false);
      }
    });

    it("disabled assets pass through to spot via getBoundedPricesView (sanity)", async () => {
      for (const c of ASSETS_TO_ENABLE) {
        const spot: BigNumber = await resilient.getUnderlyingPrice(c.vToken);
        const [coll, debt] = await dbo.getBoundedPricesView(c.vToken);
        expect(coll, `${c.name}.collateralPrice`).to.equal(spot);
        expect(debt, `${c.name}.debtPrice`).to.equal(spot);
      }
    });
  });

  testVip("VIP-666 Enable bounded pricing for 23 assets", await vip666(), {
    supporter: SUPPORTER,
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      // 23 setAssetBoundedPricingEnabled(asset, true) calls; one event each.
      await expectEvents(txResponse, [DBO_ABI], ["BoundedPricingWhitelistUpdated"], [ASSETS_TO_ENABLE.length]);
    },
  });

  // ────────────────────────────────────────────────────────────────────
  // Post-VIP state
  // ────────────────────────────────────────────────────────────────────
  describe("Post-VIP state", () => {
    describe("Whitelist flipped", () => {
      it("all 24 assets now have isBoundedPricingEnabled === true", async () => {
        for (const c of ASSET_CONFIGS) {
          expect(await dbo.isBoundedPricingEnabled(c.asset), `${c.name}.isBoundedPricingEnabled`).to.equal(true);
        }
      });

      it("getAllBoundedPricingEnabledAssets() returns all 24 underlyings", async () => {
        const enabled: string[] = await dbo.getAllBoundedPricingEnabledAssets();
        expect(enabled.length).to.equal(ASSET_CONFIGS.length);
        const set = new Set(enabled.map(a => a.toLowerCase()));
        for (const c of ASSET_CONFIGS) {
          expect(set.has(c.asset.toLowerCase()), `${c.name} (${c.asset}) missing from enabled set`).to.equal(true);
        }
      });
    });

    describe("Window reset on re-enable", () => {
      it("each newly-enabled asset has minPrice == maxPrice == current spot", async () => {
        for (const c of ASSETS_TO_ENABLE) {
          const spot: BigNumber = await resilient.getPrice(c.asset);
          const cfg = await dbo.assetProtectionConfig(c.asset);
          expect(cfg.minPrice, `${c.name}.minPrice`).to.equal(spot);
          expect(cfg.maxPrice, `${c.name}.maxPrice`).to.equal(spot);
          expect(cfg.currentlyUsingProtectedPrice, `${c.name}.currentlyUsingProtectedPrice`).to.equal(false);
        }
      });

      it("each newly-enabled asset still returns (spot, spot) — no protection armed yet", async () => {
        for (const c of ASSETS_TO_ENABLE) {
          const spot: BigNumber = await resilient.getUnderlyingPrice(c.vToken);
          const [coll, debt] = await dbo.getBoundedPricesView(c.vToken);
          expect(coll, `${c.name}.collateralPrice`).to.equal(spot);
          expect(debt, `${c.name}.debtPrice`).to.equal(spot);
        }
      });
    });

    describe("Per-asset config preserved (cooldown / thresholds / cachingEnabled unchanged)", () => {
      it("each asset's seeded params still match the VIP-665 JSON", async () => {
        for (const c of ASSET_CONFIGS) {
          const cfg = await dbo.assetProtectionConfig(c.asset);
          expect(cfg.cooldownPeriod, `${c.name}.cooldownPeriod`).to.equal(c.cooldownPeriod);
          expect(cfg.triggerThreshold.toString(), `${c.name}.triggerThreshold`).to.equal(c.triggerThreshold);
          expect(cfg.resetThreshold.toString(), `${c.name}.resetThreshold`).to.equal(c.resetThreshold);
          expect(cfg.cachingEnabled, `${c.name}.cachingEnabled`).to.equal(c.cachingEnabled);
        }
      });
    });

    describe("TRX state untouched across the VIP", () => {
      it("TRX flag, window, and protection state unchanged", async () => {
        expect(await dbo.isBoundedPricingEnabled(TRX.asset)).to.equal(true);
        const cfg = await dbo.assetProtectionConfig(TRX.asset);
        expect(cfg.currentlyUsingProtectedPrice).to.equal(false);
        const trxSpot: BigNumber = await resilient.getPrice(TRX.asset);
        expect(cfg.minPrice).to.equal(trxSpot);
        expect(cfg.maxPrice).to.equal(trxSpot);
      });
    });
  });

  describe("E2E — bounded pricing is live on ETH after VIP-666", () => {
    const ORACLE_ROLE_PIVOT = 1;

    let chainlink: Contract;
    let timelockSigner: Signer;
    let guardianSigner: Signer;
    let keeperSigner: Signer;
    let snapshotId: string;
    let originalEthSpot: BigNumber;

    before(async () => {
      snapshotId = await provider.send("evm_snapshot", []);

      chainlink = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      timelockSigner = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      guardianSigner = await initMainnetUser(GUARDIAN, ethers.utils.parseEther("1"));
      // KEEPER address granted.
      const KEEPER = "0xa44eb88198a7a94dc6d2507bc0e5a216c2410d79";
      keeperSigner = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));

      // Disable PIVOT for ETH so a deviated MAIN price flows through.
      await resilient.connect(timelockSigner).enableOracle(ETH.asset, ORACLE_ROLE_PIVOT, false);

      // Pin Chainlink (the MAIN oracle for ETH on BSC) to the live spot.
      originalEthSpot = await resilient.getPrice(ETH.asset);
      await chainlink.connect(timelockSigner).setDirectPrice(ETH.asset, originalEthSpot);
      expect(await resilient.getPrice(ETH.asset)).to.equal(originalEthSpot);
    });

    after(async () => {
      await provider.send("evm_revert", [snapshotId]);
    });

    it("pre-pump baseline: getBoundedPricesView returns (spot, spot); protection inactive", async () => {
      const [coll, debt] = await dbo.getBoundedPricesView(ETH.vToken);
      expect(coll).to.equal(originalEthSpot);
      expect(debt).to.equal(originalEthSpot);
      expect(await dbo.currentlyUsingProtectedPrice(ETH.asset)).to.equal(false);
    });

    it("50% pump triggers protection; collateral pinned at original, debt at pumped", async () => {
      // 50% pump — well above ETH's seeded ~12.5% triggerThreshold (CF=0.8).
      const pumpedSpot = originalEthSpot.mul(150).div(100);
      await chainlink.connect(timelockSigner).setDirectPrice(ETH.asset, pumpedSpot);
      expect(await resilient.getPrice(ETH.asset)).to.equal(pumpedSpot);

      const tx = await dbo.connect(keeperSigner).updateProtectionState(ETH.vToken);
      await expect(tx).to.emit(dbo, "ProtectionTriggered");
      expect(await dbo.currentlyUsingProtectedPrice(ETH.asset)).to.equal(true);

      const cfgAfter = await dbo.assetProtectionConfig(ETH.asset);
      expect(cfgAfter.minPrice).to.equal(originalEthSpot);
      expect(cfgAfter.maxPrice).to.equal(pumpedSpot);

      const [coll, debt] = await dbo.getBoundedPricesView(ETH.vToken);
      // collateral = min(spot, minPrice) = min(pumped, original) = original
      expect(coll).to.equal(originalEthSpot);
      // debt = max(spot, maxPrice) = max(pumped, pumped) = pumped
      expect(debt).to.equal(pumpedSpot);
    });

    it("spot dip in window clips both sides — collateral and debt diverge from spot", async () => {
      // Dip spot below the latched maxPrice but above the latched minPrice so
      // three distinct prices are in play.
      const dippedSpot = originalEthSpot.mul(120).div(100);
      await chainlink.connect(timelockSigner).setDirectPrice(ETH.asset, dippedSpot);

      const cfg = await dbo.assetProtectionConfig(ETH.asset);
      expect(cfg.minPrice).to.equal(originalEthSpot);
      expect(cfg.maxPrice).to.equal(originalEthSpot.mul(150).div(100));

      const [coll, debt] = await dbo.getBoundedPricesView(ETH.vToken);
      // collateral = min(spot, minPrice) = min(dipped, original) = original
      expect(coll).to.equal(originalEthSpot);
      // debt = max(spot, maxPrice) = max(dipped, pumped) = pumped
      expect(debt).to.equal(originalEthSpot.mul(150).div(100));

      const liveSpot = await resilient.getPrice(ETH.asset);
      expect(liveSpot).to.equal(dippedSpot);
      expect(coll).to.not.equal(liveSpot);
      expect(debt).to.not.equal(liveSpot);
    });

    it("Guardian CANNOT flip whitelist off while protection is active", async () => {
      expect(await dbo.currentlyUsingProtectedPrice(ETH.asset)).to.equal(true);
      await expect(dbo.connect(guardianSigner).setAssetBoundedPricingEnabled(ETH.asset, false)).to.be.reverted;
      expect(await dbo.currentlyUsingProtectedPrice(ETH.asset)).to.equal(true);
    });

    it("keeper exit path: narrow window + cooldown + exitProtectionMode clears protection", async () => {
      // Restore spot so keeper bounds (newMin ≤ spot, newMax ≥ spot) accept ±1%.
      await chainlink.connect(timelockSigner).setDirectPrice(ETH.asset, originalEthSpot);

      const tightMin = originalEthSpot.mul(99).div(100);
      const tightMax = originalEthSpot.mul(101).div(100);
      await dbo.connect(keeperSigner).updateMinPrice(ETH.asset, tightMin);
      await dbo.connect(keeperSigner).updateMaxPrice(ETH.asset, tightMax);

      const cfgBeforeExit = await dbo.assetProtectionConfig(ETH.asset);
      expect(cfgBeforeExit.minPrice).to.equal(tightMin);
      expect(cfgBeforeExit.maxPrice).to.equal(tightMax);

      await time.increase(BigNumber.from(cfgBeforeExit.cooldownPeriod).toNumber() + 1);

      await dbo.connect(keeperSigner).exitProtectionMode(ETH.asset);
      expect(await dbo.currentlyUsingProtectedPrice(ETH.asset)).to.equal(false);

      // Post-exit: protection inactive — bounded pricing returns (spot, spot).
      const spotAfterExit = await resilient.getPrice(ETH.asset);
      const [coll, debt] = await dbo.getBoundedPricesView(ETH.vToken);
      expect(coll).to.equal(spotAfterExit);
      expect(debt).to.equal(spotAfterExit);
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // Comptroller core lending operations — confirm account-liquidity
  // math is unperturbed now that ETH bounded pricing is active in the
  // steady-state path.
  // ────────────────────────────────────────────────────────────────────
  describe("E2E — Comptroller core lending operations on ETH", () => {
    const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
    const USDT_ASSET = "0x55d398326f99059fF775485246999027B3197955";
    const BORROWER = NETWORK_ADDRESSES.bscmainnet.GENERIC_ETH_ACCOUNT;

    let snapshotId: string;
    let veth: Contract;
    let vusdt: Contract;
    let eth: Contract;
    let usdt: Contract;
    let borrowerSigner: Signer;
    let timelockSigner: Signer;
    let usdtDecimals: number;
    let supplyAmount: BigNumber;
    let borrowAmount: BigNumber;

    // Mirrors liquidity math: tokensToDenom = exchangeRate × CF × price / 1e36;
    // sumCollateral = tokensToDenom × vTokenBalance / 1e18; sumBorrows = borrowBalance × price / 1e18.
    // Returns the expected (sumCollateral − sumBorrows) at the live (now-bounded) prices.
    const expectedLiquidityDelta = async (): Promise<BigNumber> => {
      const ONE = ethers.constants.WeiPerEther;
      const [, ethVTokenBal, , ethExchangeRate] = await veth.getAccountSnapshot(BORROWER);
      const [, , usdtBorrowBal] = await vusdt.getAccountSnapshot(BORROWER);
      const ethCF = (await comptroller.markets(ETH.vToken)).collateralFactorMantissa;
      const ethPrice = await resilient.getUnderlyingPrice(ETH.vToken);
      const usdtPrice = await resilient.getUnderlyingPrice(VUSDT);
      const tokensToDenom = ethExchangeRate.mul(ethCF).div(ONE).mul(ethPrice).div(ONE);
      const sumCollateral = tokensToDenom.mul(ethVTokenBal).div(ONE);
      const sumBorrows = usdtBorrowBal.mul(usdtPrice).div(ONE);
      return sumCollateral.sub(sumBorrows);
    };

    // Tolerance: $1 in 1e18 — covers rounding-order differences between this
    // computation and the on-chain lens, well under any real-bug delta.
    const LIQUIDITY_TOLERANCE = ethers.utils.parseEther("1");

    before(async () => {
      snapshotId = await provider.send("evm_snapshot", []);

      timelockSigner = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      borrowerSigner = await initMainnetUser(BORROWER, ethers.utils.parseEther("1"));

      veth = new ethers.Contract(ETH.vToken, VTOKEN_ABI, provider);
      vusdt = new ethers.Contract(VUSDT, VTOKEN_ABI, provider);
      eth = new ethers.Contract(ETH.asset, ERC20_ABI, provider);
      usdt = new ethers.Contract(USDT_ASSET, ERC20_ABI, provider);

      usdtDecimals = await usdt.decimals();
      supplyAmount = ethers.utils.parseEther("1");
      borrowAmount = ethers.utils.parseUnits("100", usdtDecimals);

      // USDT isn't in ASSET_CONFIGS — extend its resilient-oracle staleness
      // window so the borrow leg doesn't revert with "invalid resilient oracle price"
      // after the proposal lifecycle mines past USDT's heartbeat.
      await setMaxStalePeriod(resilient, usdt);

      // Lift the USDT borrow cap so the borrow leg is not bounded by it.
      await comptroller
        .connect(timelockSigner)
        ._setMarketBorrowCaps([VUSDT], [ethers.utils.parseUnits("10000000000", usdtDecimals)]);
    });

    after(async () => {
      await provider.send("evm_revert", [snapshotId]);
    });

    it("mint: supplying ETH increases the borrower's vETH balance", async () => {
      const before = await veth.balanceOf(BORROWER);
      await eth.connect(borrowerSigner).approve(ETH.vToken, supplyAmount);
      await veth.connect(borrowerSigner).mint(supplyAmount);
      expect(await veth.balanceOf(BORROWER)).to.be.gt(before);
    });

    it("borrow: enterMarkets + borrow transfers USDT to the borrower", async () => {
      await comptroller.connect(borrowerSigner).enterMarkets([ETH.vToken]);
      const before = await usdt.balanceOf(BORROWER);
      await vusdt.connect(borrowerSigner).borrow(borrowAmount);
      expect(await usdt.balanceOf(BORROWER)).to.equal(before.add(borrowAmount));
    });

    it("getAccountLiquidity matches expected (bounded-price ComptrollerLens path)", async () => {
      const expected = await expectedLiquidityDelta();
      expect(expected).to.be.gt(0);

      const [err, liquidity, shortfall] = await comptroller.getAccountLiquidity(BORROWER);
      expect(err).to.equal(0);
      expect(shortfall).to.equal(0);
      expect(liquidity).to.be.closeTo(expected, LIQUIDITY_TOLERANCE);
    });

    it("redeem: redeemUnderlying returns ETH to the borrower", async () => {
      const redeemAmount = ethers.utils.parseEther("0.1");
      const before = await eth.balanceOf(BORROWER);
      await veth.connect(borrowerSigner).redeemUnderlying(redeemAmount);
      expect(await eth.balanceOf(BORROWER)).to.equal(before.add(redeemAmount));
    });

    it("repay: repayBorrow clears the USDT debt", async () => {
      const [, , borrowBalanceBefore] = await vusdt.getAccountSnapshot(BORROWER);
      expect(borrowBalanceBefore).to.be.gt(0);

      // Repay the full borrow plus a small buffer to cover interest accrued.
      const repayAmount = borrowBalanceBefore.mul(101).div(100);
      await usdt.connect(borrowerSigner).approve(VUSDT, repayAmount);
      await vusdt.connect(borrowerSigner).repayBorrow(ethers.constants.MaxUint256);

      const [, , borrowBalanceAfter] = await vusdt.getAccountSnapshot(BORROWER);
      expect(borrowBalanceAfter).to.equal(0);
    });
  });

  // User A (1 ETH) and User B (0.5 ETH) try the same $1200 borrow.
  // X fits A's bounded capacity (~$1808) but exceeds B's bounded capacity (~$904)
  // while still fitting B's post-pump spot capacity (~$1357) — so B failing on
  // the same X proves bounded pricing, not raw spot, gates the borrow.
  describe("E2E — bounded pricing prevents over-borrowing during active protection", () => {
    const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
    const USDT_ASSET = "0x55d398326f99059fF775485246999027B3197955";
    const USER_A = NETWORK_ADDRESSES.bscmainnet.GENERIC_ETH_ACCOUNT;
    const USER_B = "0x000000000000000000000000000000000000b0bb";
    const KEEPER = "0xa44eb88198a7a94dc6d2507bc0e5a216c2410d79";
    const ORACLE_ROLE_PIVOT = 1;

    let snapshotId: string;
    let veth: Contract;
    let vusdt: Contract;
    let eth: Contract;
    let usdt: Contract;
    let chainlink: Contract;
    let timelockSigner: Signer;
    let userASigner: Signer;
    let userBSigner: Signer;
    let keeperSigner: Signer;
    let usdtDecimals: number;
    let userASupply: BigNumber;
    let userBSupply: BigNumber;
    let borrowAmount: BigNumber;
    let originalEthSpot: BigNumber;

    before(async () => {
      snapshotId = await provider.send("evm_snapshot", []);

      veth = new ethers.Contract(ETH.vToken, VTOKEN_ABI, provider);
      vusdt = new ethers.Contract(VUSDT, VTOKEN_ABI, provider);
      eth = new ethers.Contract(ETH.asset, ERC20_ABI, provider);
      usdt = new ethers.Contract(USDT_ASSET, ERC20_ABI, provider);
      chainlink = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);

      usdtDecimals = await usdt.decimals();
      userASupply = ethers.utils.parseEther("1");
      userBSupply = ethers.utils.parseEther("0.5");
      borrowAmount = ethers.utils.parseUnits("1200", usdtDecimals);

      timelockSigner = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      userASigner = await initMainnetUser(USER_A, ethers.utils.parseEther("2"));
      keeperSigner = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));

      await eth.connect(userASigner).transfer(USER_B, ethers.utils.parseEther("0.6"));
      userBSigner = await initMainnetUser(USER_B, ethers.utils.parseEther("1"));

      await setMaxStalePeriod(resilient, usdt);
      await comptroller
        .connect(timelockSigner)
        ._setMarketBorrowCaps([VUSDT], [ethers.utils.parseUnits("10000000000", usdtDecimals)]);

      await resilient.connect(timelockSigner).enableOracle(ETH.asset, ORACLE_ROLE_PIVOT, false);
      originalEthSpot = await resilient.getPrice(ETH.asset);
      await chainlink.connect(timelockSigner).setDirectPrice(ETH.asset, originalEthSpot);

      await eth.connect(userASigner).approve(ETH.vToken, userASupply);
      await veth.connect(userASigner).mint(userASupply);
      await comptroller.connect(userASigner).enterMarkets([ETH.vToken]);

      await eth.connect(userBSigner).approve(ETH.vToken, userBSupply);
      await veth.connect(userBSigner).mint(userBSupply);
      await comptroller.connect(userBSigner).enterMarkets([ETH.vToken]);
    });

    after(async () => {
      await provider.send("evm_revert", [snapshotId]);
    });

    it("User A borrows X=$1200 in steady state — succeeds (within User A's bounded capacity)", async () => {
      expect(await dbo.currentlyUsingProtectedPrice(ETH.asset)).to.equal(false);

      const before = await usdt.balanceOf(USER_A);
      await vusdt.connect(userASigner).borrow(borrowAmount);
      expect(await usdt.balanceOf(USER_A)).to.equal(before.add(borrowAmount));

      const [, , userABorrowAfter] = await vusdt.getAccountSnapshot(USER_A);
      expect(userABorrowAfter).to.be.gte(borrowAmount);
    });

    it("activate protection: 50% pump + updateProtectionState arms DBO clip on vETH", async () => {
      const pumpedSpot = originalEthSpot.mul(150).div(100);
      await chainlink.connect(timelockSigner).setDirectPrice(ETH.asset, pumpedSpot);
      expect(await resilient.getPrice(ETH.asset)).to.equal(pumpedSpot);

      const tx = await dbo.connect(keeperSigner).updateProtectionState(ETH.vToken);
      await expect(tx).to.emit(dbo, "ProtectionTriggered");
      expect(await dbo.currentlyUsingProtectedPrice(ETH.asset)).to.equal(true);

      const [boundedCollateral] = await dbo.getBoundedPricesView(ETH.vToken);
      expect(boundedCollateral).to.equal(originalEthSpot);
    });

    it("User B attempts the SAME X=$1200 with active protection — fails (bounded capacity < $1200)", async () => {
      await expect(vusdt.connect(userBSigner).borrow(borrowAmount)).to.be.reverted;

      const [, , userBBorrowAfter] = await vusdt.getAccountSnapshot(USER_B);
      expect(userBBorrowAfter).to.equal(0);
    });
  });
});
