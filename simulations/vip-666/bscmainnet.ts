import { TransactionResponse } from "@ethersproject/providers";
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
import { forking, testVip } from "src/vip-framework";
import CHAINLINK_ORACLE_ABI from "src/vip-framework/abi/chainlinkOracle.json";
import ERC20_ABI from "src/vip-framework/abi/erc20.json";
import VTOKEN_ABI from "src/vip-framework/abi/vToken.json";

import vip666, { ASSETS_TO_ENABLE, DEVIATION_BOUNDED_ORACLE } from "../../vips/vip-666/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import LIQUIDATOR_ABI from "./abi/Liquidator.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const FORK_BLOCK = 100296233;

const SUPPORTER = "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced";

// TRX already enabled
const TRX = {
  name: "TRX",
  asset: "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3",
};

forking(FORK_BLOCK, async () => {
  const provider = ethers.provider;

  let dbo: Contract;
  let resilient: Contract;
  let trxSnapshot: { minPrice: BigNumber; maxPrice: BigNumber; currentlyUsingProtectedPrice: boolean };

  before(async () => {
    dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, provider);
    resilient = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

    const assetContracts = await Promise.all(
      [...ASSETS_TO_ENABLE, TRX].map(c => ethers.getContractAt(ERC20_ABI, c.asset)),
    );
    await setMaxStalePeriodForAllAssets(resilient, assetContracts);

    const TWT = "0x4B0F1812e5Df2A09796481Ff14017e6005508003";
    await pinResilientOraclePriceViaRedstone(resilient, TWT);

    const trxCfg = await dbo.assetProtectionConfig(TRX.asset);
    trxSnapshot = {
      minPrice: trxCfg.minPrice,
      maxPrice: trxCfg.maxPrice,
      currentlyUsingProtectedPrice: trxCfg.currentlyUsingProtectedPrice,
    };
  });

  // ────────────────────────────────────────────────────────────────────
  // Pre-VIP state
  // ────────────────────────────────────────────────────────────────────
  describe("Pre-VIP state", () => {
    it("target assets have isBoundedPricingEnabled === false", async () => {
      for (const c of ASSETS_TO_ENABLE) {
        expect(await dbo.isBoundedPricingEnabled(c.asset), `${c.name}.isBoundedPricingEnabled`).to.equal(false);
      }
    });

    it("TRX is already enabled", async () => {
      expect(await dbo.isBoundedPricingEnabled(TRX.asset)).to.equal(true);
    });

    it("each disabled asset has minPrice == maxPrice and protection inactive", async () => {
      for (const c of ASSETS_TO_ENABLE) {
        const cfg = await dbo.assetProtectionConfig(c.asset);
        expect(cfg.minPrice, `${c.name}.minPrice`).to.equal(cfg.maxPrice);
        expect(cfg.currentlyUsingProtectedPrice, `${c.name}.currentlyUsingProtectedPrice`).to.equal(false);
      }
    });

    it("disabled assets pass through to spot via getBoundedPricesView", async () => {
      for (const c of ASSETS_TO_ENABLE) {
        const spot: BigNumber = await resilient.getUnderlyingPrice(c.vToken);
        const [coll, debt] = await dbo.getBoundedPricesView(c.vToken);
        expect(coll, `${c.name}.collateralPrice`).to.equal(spot);
        expect(debt, `${c.name}.debtPrice`).to.equal(spot);
      }
    });
  });

  testVip("VIP-666 Enable bounded pricing for long-tail assets", await vip666(), {
    supporter: SUPPORTER,
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [DBO_ABI], ["BoundedPricingWhitelistUpdated"], [ASSETS_TO_ENABLE.length]);
    },
  });

  // ────────────────────────────────────────────────────────────────────
  // Post-VIP state
  // ────────────────────────────────────────────────────────────────────
  describe("Post-VIP state", () => {
    describe("Whitelist flipped", () => {
      it("targeted assets (and TRX) now have isBoundedPricingEnabled === true", async () => {
        for (const c of ASSETS_TO_ENABLE) {
          expect(await dbo.isBoundedPricingEnabled(c.asset), `${c.name}.isBoundedPricingEnabled`).to.equal(true);
        }
        expect(await dbo.isBoundedPricingEnabled(TRX.asset), "TRX.isBoundedPricingEnabled").to.equal(true);
      });

      it("getAllBoundedPricingEnabledAssets() returns the targeted set plus TRX", async () => {
        const enabled: string[] = await dbo.getAllBoundedPricingEnabledAssets();
        expect(enabled.length).to.equal(ASSETS_TO_ENABLE.length + 1);
        const set = new Set(enabled.map(a => a.toLowerCase()));
        for (const c of ASSETS_TO_ENABLE) {
          expect(set.has(c.asset.toLowerCase()), `${c.name} (${c.asset}) missing from enabled set`).to.equal(true);
        }
        expect(set.has(TRX.asset.toLowerCase()), "TRX missing from enabled set").to.equal(true);
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

    describe("TRX state untouched across the VIP", () => {
      it("TRX flag, window, and protection state unchanged", async () => {
        expect(await dbo.isBoundedPricingEnabled(TRX.asset)).to.equal(true);
        const cfg = await dbo.assetProtectionConfig(TRX.asset);
        expect(cfg.minPrice).to.equal(trxSnapshot.minPrice);
        expect(cfg.maxPrice).to.equal(trxSnapshot.maxPrice);
        expect(cfg.currentlyUsingProtectedPrice).to.equal(trxSnapshot.currentlyUsingProtectedPrice);
      });
    });
  });

  // ────────────────────────────────────────────────────────────────────
  // E2E — DBO lifecycle on a newly-enabled asset (LINK).
  //
  // LINK's tokenConfig is rewritten to use Redstone only via
  // pinResilientOraclePriceViaRedstone, so every subsequent price move
  // can be driven by a single redstoneOracle.setDirectPrice call
  // ────────────────────────────────────────────────────────────────────
  describe("E2E — bounded pricing on LINK", () => {
    const KEEPER = "0xa44eb88198a7a94dc6d2507bc0e5a216c2410d79";
    const LINK_ASSET = "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD";
    const LINK_VTOKEN = "0x650b940a1033B8A1b1873f78730FcFC73ec11f1f";
    const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
    const USDT_ASSET = "0x55d398326f99059fF775485246999027B3197955";
    const LIQUIDATOR_CONTRACT = "0x0870793286aaDA55D39CE7f82fb2766e8004cF43";
    const LINK_WHALE = NETWORK_ADDRESSES.bscmainnet.GENERIC_TEST_USER_ACCOUNT;

    const BORROWER = "0x000000000000000000000000000000000000b0bb";
    const LIQUIDATOR = "0x000000000000000000000000000000000000beef";

    let redstoneOracle: Contract;
    let comptroller: Contract;
    let vlink: Contract;
    let vusdt: Contract;
    let link: Contract;
    let usdt: Contract;
    let timelockSigner: Awaited<ReturnType<typeof initMainnetUser>>;
    let keeperSigner: Awaited<ReturnType<typeof initMainnetUser>>;
    let whaleSigner: Awaited<ReturnType<typeof initMainnetUser>>;
    let borrowerSigner: Awaited<ReturnType<typeof initMainnetUser>>;
    let liquidatorSigner: Awaited<ReturnType<typeof initMainnetUser>>;
    let usdtDecimals: number;
    let originalLinkSpot: BigNumber;

    const LINK_LT = ethers.utils.parseEther("0.63");
    const LIQUIDITY_TOLERANCE = ethers.utils.parseEther("1");

    // Mirrors ComptrollerLens LT-path math (spot prices, liquidation threshold):
    //   tokensToDenom    = exchangeRate × LT × spotLinkPrice / 1e36
    //   sumCollateral    = tokensToDenom × vTokenBalance / 1e18
    //   sumBorrowEffects = usdtBorrowBalance × spotUsdtPrice / 1e18
    // Returns the signed delta (positive => liquidity, negative => shortfall).
    const expectedLtvDelta = async (): Promise<BigNumber> => {
      const ONE = ethers.constants.WeiPerEther;
      const [, vlinkBal, , exchangeRate] = await vlink.getAccountSnapshot(BORROWER);
      const [, , usdtBorrowBal] = await vusdt.getAccountSnapshot(BORROWER);
      const linkPrice = await resilient.getUnderlyingPrice(LINK_VTOKEN);
      const usdtPrice = await resilient.getUnderlyingPrice(VUSDT);
      const tokensToDenom = exchangeRate.mul(LINK_LT).div(ONE).mul(linkPrice).div(ONE);
      const sumCollateral = tokensToDenom.mul(vlinkBal).div(ONE);
      const sumBorrows = usdtBorrowBal.mul(usdtPrice).div(ONE);
      return sumCollateral.sub(sumBorrows);
    };

    before(async () => {
      timelockSigner = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1"));
      keeperSigner = await initMainnetUser(KEEPER, ethers.utils.parseEther("1"));
      whaleSigner = await initMainnetUser(LINK_WHALE, ethers.utils.parseEther("1"));
      borrowerSigner = await initMainnetUser(BORROWER, ethers.utils.parseEther("1"));
      liquidatorSigner = await initMainnetUser(LIQUIDATOR, ethers.utils.parseEther("1"));

      comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
      vlink = new ethers.Contract(LINK_VTOKEN, VTOKEN_ABI, provider);
      vusdt = new ethers.Contract(VUSDT, VTOKEN_ABI, provider);
      link = new ethers.Contract(LINK_ASSET, ERC20_ABI, provider);
      usdt = new ethers.Contract(USDT_ASSET, ERC20_ABI, provider);

      usdtDecimals = await usdt.decimals();

      await setMaxStalePeriod(resilient, usdt);
      await pinResilientOraclePriceViaRedstone(resilient, USDT_ASSET);

      await pinResilientOraclePriceViaRedstone(resilient, LINK_ASSET);
      redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);

      const linkCF = ethers.utils.parseEther("0.63");
      await comptroller
        .connect(timelockSigner)
        ["setCollateralFactor(address,uint256,uint256)"](LINK_VTOKEN, linkCF, LINK_LT);

      originalLinkSpot = await resilient.getPrice(LINK_ASSET);

      // Lift the USDT borrow cap so the borrow leg is not capped by it.
      await comptroller
        .connect(timelockSigner)
        ._setMarketBorrowCaps([VUSDT], [ethers.utils.parseUnits("10000000000", usdtDecimals)]);

      // Fund the fresh accounts from the whale.
      await link.connect(whaleSigner).transfer(BORROWER, ethers.utils.parseEther("200"));
      await usdt.connect(whaleSigner).transfer(LIQUIDATOR, ethers.utils.parseUnits("1000", usdtDecimals));
    });

    // ─── Scenario A: oracle pump → DBO clips collateral → over-borrow blocked ───
    describe("Scenario A: oracle pump arms DBO clip; bounded clip blocks over-borrow", () => {
      let snapshotId: string;
      let pumpedSpot: BigNumber;
      const supplyAmount = ethers.utils.parseEther("100"); // 100 LINK
      let initialBorrowAmount: BigNumber;
      let overBorrowAmount: BigNumber;

      before(async () => {
        snapshotId = await provider.send("evm_snapshot", []);

        initialBorrowAmount = ethers.utils.parseUnits("200", usdtDecimals);
        overBorrowAmount = ethers.utils.parseUnits("500", usdtDecimals);
      });

      after(async () => {
        await provider.send("evm_revert", [snapshotId]);
      });

      it("setup: borrower supplies LINK, enters market, and takes initial USDT borrow", async () => {
        await link.connect(borrowerSigner).approve(LINK_VTOKEN, supplyAmount);
        await vlink.connect(borrowerSigner).mint(supplyAmount);
        await comptroller.connect(borrowerSigner).enterMarkets([LINK_VTOKEN]);

        // mint stores vTokens = supplyAmount × 1e18 / exchangeRate (truncated).
        const exchangeRate = await vlink.exchangeRateStored();
        const expectedVlink = supplyAmount.mul(ethers.constants.WeiPerEther).div(exchangeRate);
        expect(await vlink.balanceOf(BORROWER)).to.equal(expectedVlink);

        await vusdt.connect(borrowerSigner).borrow(initialBorrowAmount);
        const [, , usdtDebt] = await vusdt.getAccountSnapshot(BORROWER);
        expect(usdtDebt).to.equal(initialBorrowAmount);
      });

      it("baseline: DBO returns (spot, spot); borrower liquidity matches lens math", async () => {
        const [coll, debt] = await dbo.getBoundedPricesView(LINK_VTOKEN);
        expect(coll).to.equal(originalLinkSpot);
        expect(debt).to.equal(originalLinkSpot);

        const expected = await expectedLtvDelta();
        const [err, liquidity, shortfall] = await comptroller.getAccountLiquidity(BORROWER);
        expect(err).to.equal(0);
        expect(shortfall).to.equal(0);
        expect(liquidity).to.be.closeTo(expected, LIQUIDITY_TOLERANCE);
      });

      it("50% pump + updateProtectionState arms DBO clip — collateral pinned at original, debt at pumped", async () => {
        pumpedSpot = originalLinkSpot.mul(150).div(100);
        await redstoneOracle.connect(timelockSigner).setDirectPrice(LINK_ASSET, pumpedSpot);
        expect(await resilient.getPrice(LINK_ASSET)).to.equal(pumpedSpot);

        const tx = await dbo.connect(keeperSigner).updateProtectionState(LINK_VTOKEN);
        await expect(tx).to.emit(dbo, "ProtectionTriggered");
        expect(await dbo.currentlyUsingProtectedPrice(LINK_ASSET)).to.equal(true);

        const cfg = await dbo.assetProtectionConfig(LINK_ASSET);
        expect(cfg.minPrice).to.equal(originalLinkSpot);
        expect(cfg.maxPrice).to.equal(pumpedSpot);

        const [coll, debt] = await dbo.getBoundedPricesView(LINK_VTOKEN);
        // collateral = min(spot, minPrice) = min(pumped, original) = original
        expect(coll).to.equal(originalLinkSpot);
        // debt = max(spot, maxPrice) = max(pumped, pumped) = pumped
        expect(debt).to.equal(pumpedSpot);
      });

      it("borrower cannot borrow against pumped valuation — bounded capacity gates the borrow", async () => {
        // Even though spot capacity grew ~50%, the bounded view keeps LINK
        // collateral pinned at originalLinkSpot, so the additional borrow that
        // would clear at spot must revert.
        await expect(vusdt.connect(borrowerSigner).borrow(overBorrowAmount)).to.be.reverted;
      });
    });

    // ─── Scenario B: oracle crash → bounded minPrice latches down → liquidation flow works ───
    describe("Scenario B: oracle crash → bounded clip tracks spot down → liquidation at spot valuation", () => {
      let snapshotId: string;
      let crashedSpot: BigNumber;
      const supplyAmount = ethers.utils.parseEther("100");
      let borrowAmount: BigNumber;

      before(async () => {
        snapshotId = await provider.send("evm_snapshot", []);

        // Push borrow to ~75% of capacity so a 50% crash flips the account
        // into shortfall. 100 LINK * $9.5 * 0.63 ≈ $599 capacity → borrow ~$450.
        borrowAmount = ethers.utils.parseUnits("450", usdtDecimals);

        await link.connect(borrowerSigner).approve(LINK_VTOKEN, supplyAmount);
        await vlink.connect(borrowerSigner).mint(supplyAmount);
        await comptroller.connect(borrowerSigner).enterMarkets([LINK_VTOKEN]);
        await vusdt.connect(borrowerSigner).borrow(borrowAmount);
      });

      after(async () => {
        await provider.send("evm_revert", [snapshotId]);
      });

      it("baseline: borrower is solvent at original spot", async () => {
        const [err, , shortfall] = await comptroller.getAccountLiquidity(BORROWER);
        expect(err).to.equal(0);
        expect(shortfall).to.equal(0);
      });

      it("50% crash + updateProtectionState latches minPrice down — collateral tracks crashed spot", async () => {
        crashedSpot = originalLinkSpot.div(2);
        await redstoneOracle.connect(timelockSigner).setDirectPrice(LINK_ASSET, crashedSpot);
        expect(await resilient.getPrice(LINK_ASSET)).to.equal(crashedSpot);

        const tx = await dbo.connect(keeperSigner).updateProtectionState(LINK_VTOKEN);
        await expect(tx).to.emit(dbo, "ProtectionTriggered");
        expect(await dbo.currentlyUsingProtectedPrice(LINK_ASSET)).to.equal(true);

        const cfg = await dbo.assetProtectionConfig(LINK_ASSET);
        // minPrice latches down to crashed spot; maxPrice stays at original.
        expect(cfg.minPrice).to.equal(crashedSpot);
        expect(cfg.maxPrice).to.equal(originalLinkSpot);

        // collateral = min(spot, minPrice) = min(crashed, crashed)
        const [coll] = await dbo.getBoundedPricesView(LINK_VTOKEN);
        expect(coll).to.equal(crashedSpot);
      });

      it("borrower is in shortfall after the crash; shortfall matches lens math", async () => {
        const expected = await expectedLtvDelta();
        const [err, liquidity, shortfall] = await comptroller.getAccountLiquidity(BORROWER);
        expect(err).to.equal(0);
        expect(liquidity).to.equal(0);
        // expected is negative when in shortfall.
        expect(shortfall).to.be.closeTo(expected.mul(-1), LIQUIDITY_TOLERANCE);
      });

      it("liquidator repays USDT and seizes vLINK", async () => {
        const liquidator = new ethers.Contract(LIQUIDATOR_CONTRACT, LIQUIDATOR_ABI, provider);
        const repayAmount = ethers.utils.parseUnits("50", usdtDecimals);

        await usdt.connect(liquidatorSigner).approve(LIQUIDATOR_CONTRACT, repayAmount);

        const liquidatorVlinkBefore = await vlink.balanceOf(LIQUIDATOR);
        await expect(
          liquidator.connect(liquidatorSigner).liquidateBorrow(VUSDT, BORROWER, repayAmount, LINK_VTOKEN),
        ).to.emit(vusdt, "LiquidateBorrow");
        expect(await vlink.balanceOf(LIQUIDATOR)).to.be.gt(liquidatorVlinkBefore);
      });
    });
  });
});
