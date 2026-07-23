import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser, setMaxStaleCoreAssets } from "src/utils";
import { forking } from "src/vip-framework";

import ERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import VBEP20_ABI from "./abi/VBep20Abi.json";
import CHAINLINK_ABI from "./abi/chainlinkOracle.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import LIQUIDATOR_ABI from "./abi/liquidatorAbi.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

// ---------------------------------------------------------------------------
// Pinned fork block (bscmainnet). All addresses/params below are re-read live
// on this block by the test itself — nothing here is hard-asserted blindly.
// ---------------------------------------------------------------------------
const FORK_BLOCK = 111600000;

// Core pool
const UNITROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const RESILIENT_ORACLE = "0x6592b5de802159f3e74b2486b091d11a8256ab8a";

// Enforced Liquidator (== Comptroller.liquidatorContract()) and its treasury sink
const LIQUIDATOR = "0x0870793286aada55d39ce7f82fb2766e8004cf43";
const PROTOCOL_SHARE_RESERVE = "0xca01d5a9a248a830e9d93231e791b1affed7c446";

// Collateral market: vBTC / BTCB
const VBTC = "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";

// Borrowed market: vUSDT / USDT
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

// Oracle plumbing for BTCB inside the ResilientOracle (main / pivot / fallback).
const CHAINLINK_ORACLE = "0x1b2103441a0a108dad8848d8f5d790e4d402921f"; // main oracle for BTCB

// Owner of the oracle contracts / ACM-authorised caller for setDirectPrice.
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

// Binance hot wallet — holds plenty of both BTCB and USDT on this block.
const WHALE = "0xf977814e90da44bfa03b6295a0616a897441acec";

// Freshly-derived EOAs used purely as test actors.
const BORROWER = "0x0000000000000000000000000000000000000B0b";
const LIQUIDATOR_EOA = "0x000000000000000000000000000000000000abC1";

// --- Analysis knobs (documented in README.md) -------------------------------
const SUPPLY_BTCB = parseUnits("2", 18); // collateral the borrower supplies
const BORROW_FRACTION_BPS = 9000; // borrow 90% of the CF-adjusted limit (leaves a buffer)
const PRICE_DROP_BPS = 1800; // crash BTCB 18% to push the account into shortfall
const MAX_LIQUIDATIONS = 12; // safety bound on the recovery loop

const MANTISSA_ONE = parseUnits("1", 18);
const usd = (v: BigNumber): number => Number(formatUnits(v, 18));

forking(FORK_BLOCK, async () => {
  const provider = ethers.provider;

  let comptroller: Contract;
  let resilientOracle: Contract;
  let chainlinkOracle: Contract;
  let liquidator: Contract;
  let vBtc: Contract;
  let vUsdt: Contract;
  let btcb: Contract;
  let usdt: Contract;

  let whale: SignerWithAddress;
  let borrower: SignerWithAddress;
  let liquidatorSigner: SignerWithAddress;
  let timelock: SignerWithAddress;

  // Live-read protocol parameters (populated in `before`).
  let closeFactor: BigNumber;
  let liquidationIncentive: BigNumber;
  let treasuryPercent: BigNumber;
  let usdtPrice: BigNumber;
  let btcbPriceBefore: BigNumber;
  let btcbPriceAfter: BigNumber;

  // Recovery / leakage accumulators.
  let totalRepaid = BigNumber.from(0); // USDT base units repaid across all liquidations
  let seizeTreasuryVTokens = BigNumber.from(0); // vBTC that went to the treasury
  let seizeLiquidatorVTokens = BigNumber.from(0); // vBTC that went to the liquidator
  let shortfallBefore = BigNumber.from(0);
  let shortfallAfter = BigNumber.from(0);
  let remainingDebt = BigNumber.from(0); // outstanding USDT debt after recovery (still collateralised)

  let psrBtcbBefore: BigNumber;
  let liquidatorVBtcBefore: BigNumber;
  let borrowerVBtcBefore: BigNumber;

  const liquidatorIface = new ethers.utils.Interface(LIQUIDATOR_ABI);

  before(async () => {
    comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, provider);
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    chainlinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ABI, provider);
    liquidator = new ethers.Contract(LIQUIDATOR, LIQUIDATOR_ABI, provider);
    vBtc = new ethers.Contract(VBTC, VBEP20_ABI, provider);
    vUsdt = new ethers.Contract(VUSDT, VBEP20_ABI, provider);
    btcb = new ethers.Contract(BTCB, ERC20_ABI, provider);
    usdt = new ethers.Contract(USDT, ERC20_ABI, provider);

    whale = await initMainnetUser(WHALE, parseUnits("10", 18));
    borrower = await initMainnetUser(BORROWER, parseUnits("10", 18));
    liquidatorSigner = await initMainnetUser(LIQUIDATOR_EOA, parseUnits("10", 18));
    timelock = await initMainnetUser(NORMAL_TIMELOCK, parseUnits("10", 18));

    // Read the live parameters that drive the whole analysis (never hard-assumed).
    closeFactor = await comptroller.closeFactorMantissa();
    liquidationIncentive = await comptroller.getLiquidationIncentive(VBTC);
    treasuryPercent = await liquidator.treasuryPercentMantissa();
    usdtPrice = await resilientOracle.getUnderlyingPrice(VUSDT);
  });

  describe("Live protocol parameters", () => {
    it("routes core liquidations through the enforced Liquidator", async () => {
      expect((await comptroller.liquidatorContract()).toLowerCase()).to.equal(LIQUIDATOR.toLowerCase());
    });

    it("close factor is 50% and vBTC incentive is 10%", async () => {
      expect(closeFactor).to.equal(parseUnits("0.5", 18));
      expect(liquidationIncentive).to.equal(parseUnits("1.1", 18));
    });

    it("Liquidator recaptures 50% of the bonus to the ProtocolShareReserve", async () => {
      expect(treasuryPercent).to.equal(parseUnits("0.5", 18));
      expect((await liquidator.protocolShareReserve()).toLowerCase()).to.equal(PROTOCOL_SHARE_RESERVE.toLowerCase());
    });
  });

  describe("Step 1 — build a healthy vBTC-collateralised position", () => {
    it("borrower supplies BTCB, enters the market and borrows USDT (starts healthy)", async () => {
      // Source BTCB to the borrower and mint vBTC.
      await btcb.connect(whale).transfer(BORROWER, SUPPLY_BTCB);
      await btcb.connect(borrower).approve(VBTC, SUPPLY_BTCB);
      expect(await vBtc.connect(borrower).callStatic.mint(SUPPLY_BTCB)).to.equal(0);
      await vBtc.connect(borrower).mint(SUPPLY_BTCB);
      await comptroller.connect(borrower).enterMarkets([VBTC]);

      // Healthy before borrowing.
      let [, liquidity, shortfall] = await comptroller.getAccountLiquidity(BORROWER);
      expect(shortfall).to.equal(0);
      expect(liquidity).to.be.gt(0);

      // Borrow BORROW_FRACTION of the remaining borrowing power, denominated in USDT.
      const borrowUsd = liquidity.mul(BORROW_FRACTION_BPS).div(10000);
      const borrowUsdt = borrowUsd.mul(MANTISSA_ONE).div(usdtPrice);
      expect(await vUsdt.connect(borrower).callStatic.borrow(borrowUsdt)).to.equal(0);
      await vUsdt.connect(borrower).borrow(borrowUsdt);

      // Still healthy right after the borrow (buffer intact).
      [, liquidity, shortfall] = await comptroller.getAccountLiquidity(BORROWER);
      expect(shortfall).to.equal(0);
      expect(liquidity).to.be.gt(0);

      btcbPriceBefore = await resilientOracle.getUnderlyingPrice(VBTC);
      console.log(
        `\n[setup] supplied ${formatUnits(SUPPLY_BTCB, 18)} BTCB @ $${usd(btcbPriceBefore).toLocaleString()}, ` +
          `borrowed ${formatUnits(borrowUsdt, 18)} USDT`,
      );
    });
  });

  describe("Step 2 — force the account into shortfall (oracle crash)", () => {
    it("crashing BTCB ~18% pushes the account underwater", async () => {
      // Avoid staleness reverts on the core Chainlink feed.
      await setMaxStaleCoreAssets(CHAINLINK_ORACLE, NORMAL_TIMELOCK);

      // Isolate BTCB pricing to the main (Chainlink) oracle only: disable the pivot
      // bound-validation and the fallback so setDirectPrice flows straight through the
      // ResilientOracle (otherwise an 18% deviation would be rejected vs the pivot and the
      // real fallback price would be returned instead). OracleRole: MAIN=0, PIVOT=1, FALLBACK=2.
      await resilientOracle.connect(timelock).enableOracle(BTCB, 1, false); // disable PIVOT
      await resilientOracle.connect(timelock).enableOracle(BTCB, 2, false); // disable FALLBACK

      btcbPriceAfter = btcbPriceBefore.mul(10000 - PRICE_DROP_BPS).div(10000);
      await chainlinkOracle.connect(timelock).setDirectPrice(BTCB, btcbPriceAfter);

      // The resilient oracle now reports the crashed price.
      expect(await resilientOracle.getUnderlyingPrice(VBTC)).to.equal(btcbPriceAfter);

      const [, , shortfall] = await comptroller.getAccountLiquidity(BORROWER);
      shortfallBefore = shortfall;
      expect(shortfall).to.be.gt(0);
      console.log(
        `[crash]  BTCB $${usd(btcbPriceBefore).toLocaleString()} -> $${usd(btcbPriceAfter).toLocaleString()} ` +
          `(-${PRICE_DROP_BPS / 100}%), shortfall = $${usd(shortfall).toLocaleString()}`,
      );
    });
  });

  describe("Step 3 — execute the forced liquidation(s): the recovery path", () => {
    it("liquidates in closeFactor-bounded steps until the account is healthy again", async () => {
      // Fund the liquidator EOA with USDT and approve the enforced Liquidator.
      const fundUsdt = parseUnits("5000000", 18);
      await usdt.connect(whale).transfer(LIQUIDATOR_EOA, fundUsdt);
      await usdt.connect(liquidatorSigner).approve(LIQUIDATOR, ethers.constants.MaxUint256);

      // Any EOA may liquidate this borrower (not restricted).
      expect(await liquidator.liquidationRestricted(BORROWER)).to.equal(false);

      psrBtcbBefore = await btcb.balanceOf(PROTOCOL_SHARE_RESERVE);
      liquidatorVBtcBefore = await vBtc.balanceOf(LIQUIDATOR_EOA);
      borrowerVBtcBefore = await vBtc.balanceOf(BORROWER);

      let iterations = 0;
      for (let i = 0; i < MAX_LIQUIDATIONS; i++) {
        const [, , shortfall] = await comptroller.getAccountLiquidity(BORROWER);
        if (shortfall.isZero()) break;

        const borrowBalance = await vUsdt.callStatic.borrowBalanceCurrent(BORROWER);
        if (borrowBalance.isZero()) break;

        // Repay up to closeFactor of the outstanding debt.
        const repay = borrowBalance.mul(closeFactor).div(MANTISSA_ONE);
        const borrowerVBtc = await vBtc.balanceOf(BORROWER);
        if (borrowerVBtc.isZero()) break; // collateral exhausted -> bad debt

        const tx = await liquidator.connect(liquidatorSigner).liquidateBorrow(VUSDT, BORROWER, repay, VBTC);
        const receipt = await tx.wait();

        for (const log of receipt.logs) {
          if (log.address.toLowerCase() !== LIQUIDATOR.toLowerCase()) continue;
          let parsed;
          try {
            parsed = liquidatorIface.parseLog(log);
          } catch {
            continue;
          }
          if (parsed.name !== "LiquidateBorrowedTokens") continue;
          totalRepaid = totalRepaid.add(parsed.args.repayAmount);
          seizeTreasuryVTokens = seizeTreasuryVTokens.add(parsed.args.seizeTokensForTreasury);
          seizeLiquidatorVTokens = seizeLiquidatorVTokens.add(parsed.args.seizeTokensForLiquidator);
        }
        iterations++;
      }

      const [, , shortfall] = await comptroller.getAccountLiquidity(BORROWER);
      shortfallAfter = shortfall;
      remainingDebt = await vUsdt.callStatic.borrowBalanceCurrent(BORROWER);

      console.log(`[recover] ${iterations} liquidation(s), final shortfall = $${usd(shortfallAfter).toLocaleString()}`);

      // Recovery proof: the underwater position was brought back to health.
      expect(iterations).to.be.gt(0);
      expect(shortfallAfter).to.equal(0);
    });
  });

  describe("Step 4 — quantify liquidation-incentive leakage & reconcile", () => {
    it("measured treasury/liquidator split matches the incentive formula and leakage is ~5% of debt", async () => {
      const exchangeRate = await vBtc.callStatic.exchangeRateCurrent();

      // Measured balance deltas.
      const psrBtcbGain = (await btcb.balanceOf(PROTOCOL_SHARE_RESERVE)).sub(psrBtcbBefore);
      const liquidatorVBtcGain = (await vBtc.balanceOf(LIQUIDATOR_EOA)).sub(liquidatorVBtcBefore);
      const borrowerVBtcLoss = borrowerVBtcBefore.sub(await vBtc.balanceOf(BORROWER));

      // Sanity: the event-reported split matches the on-chain balance moves.
      expect(liquidatorVBtcGain).to.equal(seizeLiquidatorVTokens);
      expect(borrowerVBtcLoss).to.equal(seizeTreasuryVTokens.add(seizeLiquidatorVTokens));

      // Convert vBTC -> BTCB (underlying = vTokens * exchangeRate / 1e18).
      const vTokensToBtcb = (v: BigNumber) => v.mul(exchangeRate).div(MANTISSA_ONE);
      const btcbToUsd = (b: BigNumber) => b.mul(btcbPriceAfter).div(MANTISSA_ONE); // valued at the liquidation (crashed) price

      const closeTo = (measured: BigNumber, expected: BigNumber, toleranceBps: number) => {
        const diff = measured.sub(expected).abs();
        expect(diff.mul(10000).lte(expected.mul(toleranceBps))).to.equal(
          true,
          `expected ${usd(measured)} ≈ ${usd(expected)} (±${toleranceBps / 100}%)`,
        );
      };

      const debtClearedUsd = totalRepaid.mul(usdtPrice).div(MANTISSA_ONE);

      // Treasury: use the BTCB actually delivered to the ProtocolShareReserve (authoritative).
      // The liquidator still holds its share as vBTC, so value it via the exchange rate.
      const treasuryBtcb = psrBtcbGain;
      const liquidatorBtcb = vTokensToBtcb(seizeLiquidatorVTokens);
      const seizedBtcb = treasuryBtcb.add(liquidatorBtcb);

      const treasuryUsd = btcbToUsd(treasuryBtcb);
      const liquidatorUsd = btcbToUsd(liquidatorBtcb);
      const seizedUsd = btcbToUsd(seizedBtcb);

      // Penalty = seized value − debt cleared (the full 10% incentive).
      const penaltyUsd = seizedUsd.sub(debtClearedUsd);
      // External leakage = liquidator's collateral value − principal (debt they cleared).
      const leakageUsd = liquidatorUsd.sub(debtClearedUsd);

      // The treasury BTCB delivered to the ProtocolShareReserve matches the treasury share the
      // Liquidator redeemed from vBTC (redeem action active); dust-level rounding tolerance.
      closeTo(psrBtcbGain, vTokensToBtcb(seizeTreasuryVTokens), 10); // ±0.1%

      // --- Reconcile measured vs closed-form -------------------------------
      // seized ≈ 1.1 × debt cleared
      const expectedSeizedUsd = debtClearedUsd.mul(liquidationIncentive).div(MANTISSA_ONE);
      // bonus = seized × (incentive−1)/incentive ; treasury = bonus × treasuryPercent
      const bonusUsd = seizedUsd.mul(liquidationIncentive.sub(MANTISSA_ONE)).div(liquidationIncentive);
      const expectedTreasuryUsd = bonusUsd.mul(treasuryPercent).div(MANTISSA_ONE);
      const expectedLeakageUsd = bonusUsd.sub(expectedTreasuryUsd);

      closeTo(seizedUsd, expectedSeizedUsd, 50); // ±0.5%
      closeTo(treasuryUsd, expectedTreasuryUsd, 50);
      closeTo(leakageUsd, expectedLeakageUsd, 50);
      // Treasury recapture and external leakage are each ~5% of the debt cleared.
      closeTo(treasuryUsd, debtClearedUsd.mul(500).div(10000), 100); // ±1%
      closeTo(leakageUsd, debtClearedUsd.mul(500).div(10000), 100);

      const pct = (v: BigNumber) => `${((usd(v) / usd(debtClearedUsd)) * 100).toFixed(2)}%`;
      console.log("\n=========================== LIQUIDATION-INCENTIVE LEAKAGE ===========================");
      console.log(` Fork block ............... bscmainnet #${FORK_BLOCK}`);
      console.log(` Recovery ................. shortfall $${usd(shortfallBefore).toLocaleString()} -> $0 (healthy)`);
      // Bad debt only exists if collateral is exhausted while a shortfall remains; here shortfall == 0.
      const remainingDebtUsd = remainingDebt.mul(usdtPrice).div(MANTISSA_ONE);
      const badDebtUsd = shortfallAfter.isZero() ? BigNumber.from(0) : remainingDebtUsd;
      console.log(` Remaining debt (healthy)   $${usd(remainingDebtUsd).toLocaleString()}  (fully collateralised)`);
      console.log(` Residual bad debt ........ $${usd(badDebtUsd).toFixed(2)}`);
      console.log("-------------------------------------------------------------------------------------");
      console.log(` Debt cleared ............. $${usd(debtClearedUsd).toLocaleString()}`);
      console.log(
        ` Collateral seized ........ ${Number(formatUnits(seizedBtcb, 18)).toFixed(6)} BTCB` +
          ` = $${usd(seizedUsd).toLocaleString()}  (${pct(seizedUsd)} of debt)`,
      );
      console.log(` Liquidation penalty (10%)  $${usd(penaltyUsd).toLocaleString()}  (${pct(penaltyUsd)} of debt)`);
      console.log("-------------------------------------------------------------------------------------");
      console.log(` Treasury recapture ....... $${usd(treasuryUsd).toLocaleString()}  (${pct(treasuryUsd)} of debt)`);
      console.log(` External leakage ......... $${usd(leakageUsd).toLocaleString()}  (${pct(leakageUsd)} of debt)`);
      console.log("=====================================================================================\n");
    });
  });
});
