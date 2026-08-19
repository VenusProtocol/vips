import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  BORROW_ACTION,
  CAPO_GROWTH_RATE_PER_YEAR,
  CAPO_SEED_TIMESTAMP,
  CAPO_SNAPSHOT_INTERVAL,
  DBO_COOLDOWN_PERIOD,
  DBO_RESET_THRESHOLD,
  DBO_TRIGGER_THRESHOLD,
  DEVIATION_BOUNDED_ORACLE,
  MARKETS,
  PROTOCOL_SHARE_RESERVE,
  REDUCE_RESERVES_BLOCK_DELTA,
  convertAmountToVTokens,
  seededSnapshot,
  snapshotGap,
  vTokensRemaining,
  vip664,
} from "../../vips/vip-664/bscmainnet";
import CAPPED_ORACLE_ABI from "./abi/CappedOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import DBO_ABI from "./abi/DeviationBoundedOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import ERC4626_ABI from "./abi/ERC4626.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const SECONDS_PER_YEAR = 31536000;
// A 24-decimal share priced by the ResilientOracle is returned at 10**(36-24) = 10**12, so a
// ~$1 vault share is ~1e12. The band catches a decimals mistake in the deployed oracle.
const ONE_SHARE = parseUnits("1", 24);
const MIN_SHARE_PRICE = parseUnits("0.95", 12);
const MAX_SHARE_PRICE = parseUnits("1.05", 12);

// TODO(deploy): bump to a block after the 3 capped ERC4626 oracles and 3 vTokens are deployed and
// the VTreasury has been funded with the bootstrap vhTokens.
const FORK_BLOCK = 116824477;

forking(FORK_BLOCK, async () => {
  const comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const dbo = new ethers.Contract(DEVIATION_BOUNDED_ORACLE, DBO_ABI, ethers.provider);

  // The bootstrap must draw from the Treasury's real balance, so snapshot it before executing.
  const treasuryBalanceBefore: Record<string, BigNumber> = {};

  before(async () => {
    for (const m of MARKETS) {
      const underlying = new ethers.Contract(m.vToken.underlying.address, ERC20_ABI, ethers.provider);
      treasuryBalanceBefore[m.vToken.address] = await underlying.balanceOf(bscmainnet.VTREASURY);
    }
  });

  describe("Pre-VIP behavior", async () => {
    for (const m of MARKETS) {
      it(`${m.vToken.symbol} market is not listed`, async () => {
        const market = await comptroller.markets(m.vToken.address);
        expect(market.isListed).to.equal(false);
      });

      it(`${m.vToken.underlying.symbol} has no price`, async () => {
        await expect(resilientOracle.getPrice(m.vToken.underlying.address)).to.be.reverted;
      });

      it(`VTreasury holds enough ${m.vToken.underlying.symbol} for the bootstrap`, async () => {
        const underlying = new ethers.Contract(m.vToken.underlying.address, ERC20_ABI, ethers.provider);
        expect(await underlying.balanceOf(bscmainnet.VTREASURY)).to.be.gte(m.initialSupply.amount);
      });
    }
  });

  testVip("VIP-664", await vip664(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI, CAPPED_ORACLE_ABI],
        [
          "SnapshotUpdated",
          "GrowthRateUpdated",
          "SnapshotGapUpdated",
          "MarketListed",
          "NewSupplyCap",
          "ActionPausedMarket",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
        ],
        [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const m of MARKETS) {
      describe(`${m.vToken.symbol} market`, async () => {
        const vToken = new ethers.Contract(m.vToken.address, VTOKEN_ABI, ethers.provider);
        const underlying = new ethers.Contract(m.vToken.underlying.address, ERC20_ABI, ethers.provider);
        const vault = new ethers.Contract(m.vToken.underlying.address, ERC4626_ABI, ethers.provider);
        const cappedOracle = new ethers.Contract(m.oracle.address, CAPPED_ORACLE_ABI, ethers.provider);

        it("check new IRM", async () => {
          expect(await vToken.interestRateModel()).to.equal(m.rateModel);
        });

        checkInterestRate(m.rateModel, m.vToken.symbol, {
          base: m.interestRateModel.baseRatePerYear,
          multiplier: m.interestRateModel.multiplierPerYear,
          jump: m.interestRateModel.jumpMultiplierPerYear,
          kink: m.interestRateModel.kink,
        });

        checkVToken(m.vToken.address, {
          name: m.vToken.name,
          symbol: m.vToken.symbol,
          decimals: m.vToken.decimals,
          underlying: m.vToken.underlying,
          exchangeRate: m.vToken.exchangeRate,
          comptroller: m.vToken.comptroller,
        });

        checkRiskParameters(m.vToken.address, m.vToken, m.riskParameters);

        // checkRiskParameters skips both on the legacy pool, but the Core Comptroller stores them
        // per market and this VIP sets them, so assert them here.
        it("sets the liquidation threshold", async () => {
          expect(await comptroller.getLiquidationThreshold(m.vToken.address)).to.equal(
            m.riskParameters.liquidationThreshold,
          );
        });

        it("sets the liquidation incentive", async () => {
          expect(await comptroller.getLiquidationIncentive(m.vToken.address)).to.equal(
            m.riskParameters.liquidationIncentive,
          );
        });

        it("registers the capped ERC4626 oracle as the only ResilientOracle source", async () => {
          const config = await resilientOracle.getTokenConfig(m.vToken.underlying.address);
          expect(config.oracles[0]).to.equal(m.oracle.address);
          expect(config.enableFlagsForOracles).to.deep.equal([true, false, false]);
        });

        it("wires the capped oracle to the vault and its ERC4626 asset", async () => {
          expect(await cappedOracle.CORRELATED_TOKEN()).to.equal(m.vToken.underlying.address);
          expect(await cappedOracle.UNDERLYING_TOKEN()).to.equal(await vault.asset());
          expect(await cappedOracle.RESILIENT_ORACLE()).to.equal(bscmainnet.RESILIENT_ORACLE);
        });

        it("arms the growth cap at 5%/yr over a 30-day snapshot", async () => {
          expect(await cappedOracle.growthRatePerSecond()).to.equal(CAPO_GROWTH_RATE_PER_YEAR.div(SECONDS_PER_YEAR));
          expect(await cappedOracle.snapshotInterval()).to.equal(CAPO_SNAPSHOT_INTERVAL);
          expect(await cappedOracle.snapshotGap()).to.equal(snapshotGap(m.oracle.seedExchangeRate));
          expect(await cappedOracle.snapshotMaxExchangeRate()).to.equal(seededSnapshot(m.oracle.seedExchangeRate));
          expect(await cappedOracle.snapshotTimestamp()).to.equal(CAPO_SEED_TIMESTAMP);
        });

        it("does not list the market already capped", async () => {
          // A seed below the live rate would cap the price the moment the market lists.
          expect(await cappedOracle.isCapped()).to.equal(false);
          expect(await cappedOracle.getMaxAllowedExchangeRate()).to.be.gte(await cappedOracle.getUnderlyingAmount());
        });

        it("prices the vault at its ERC4626 asset price times the vault exchange rate", async () => {
          const assetPrice = await resilientOracle.getPrice(await vault.asset());
          const exchangeRate = await vault.convertToAssets(ONE_SHARE);
          const price = await resilientOracle.getPrice(m.vToken.underlying.address);

          expect(price).to.equal(assetPrice.mul(exchangeRate).div(ONE_SHARE));
          expect(price).to.be.gt(MIN_SHARE_PRICE).and.lt(MAX_SHARE_PRICE);
          expect(await resilientOracle.getUnderlyingPrice(m.vToken.address)).to.equal(price);
        });

        it("enables Oracle Dynamic Protection Mode with a 5% trigger", async () => {
          const cfg = await dbo.assetProtectionConfig(m.vToken.underlying.address);
          expect(cfg.isBoundedPricingEnabled).to.equal(true);
          expect(cfg.triggerThreshold).to.equal(DBO_TRIGGER_THRESHOLD);
          expect(cfg.resetThreshold).to.equal(DBO_RESET_THRESHOLD);
          expect(cfg.cooldownPeriod).to.equal(DBO_COOLDOWN_PERIOD);
          expect(cfg.cachingEnabled).to.equal(false);
        });

        it("market has correct owner", async () => {
          expect(await vToken.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
        });

        it("market has correct ACM", async () => {
          expect(await vToken.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
        });

        it("market has correct protocol share reserve", async () => {
          expect(await vToken.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
        });

        it("market has correct reduce reserves block delta", async () => {
          expect(await vToken.reduceReservesBlockDelta()).to.equal(REDUCE_RESERVES_BLOCK_DELTA);
        });

        it("market has correct total supply", async () => {
          expect(await vToken.totalSupply()).to.equal(
            convertAmountToVTokens(m.initialSupply.amount, m.vToken.exchangeRate),
          );
        });

        it("market has balance of underlying", async () => {
          expect(await underlying.balanceOf(m.vToken.address)).to.equal(m.initialSupply.amount);
        });

        it("bootstrap drew the initial supply from the VTreasury's real balance", async () => {
          const balanceAfter = await underlying.balanceOf(bscmainnet.VTREASURY);
          expect(treasuryBalanceBefore[m.vToken.address].sub(balanceAfter)).to.equal(m.initialSupply.amount);
        });

        it("should not leave any vTokens in the timelock", async () => {
          expect(await vToken.balanceOf(bscmainnet.NORMAL_TIMELOCK)).to.equal(0);
        });

        it("should burn vTokens", async () => {
          expect(await vToken.balanceOf(ethers.constants.AddressZero)).to.equal(m.initialSupply.vTokensToBurn);
        });

        it("should send remaining vTokens to vTokenReceiver", async () => {
          expect(await vToken.balanceOf(m.initialSupply.vTokenReceiver)).to.equal(vTokensRemaining(m));
        });

        it("should leave no underlying approval to the vToken", async () => {
          expect(await underlying.allowance(bscmainnet.NORMAL_TIMELOCK, m.vToken.address)).to.equal(0);
        });

        it("should pause borrowing on the market", async () => {
          expect(await comptroller.actionPaused(m.vToken.address, BORROW_ACTION)).to.equal(true);
        });

        it("should keep the borrow cap at zero", async () => {
          expect(await comptroller.borrowCaps(m.vToken.address)).to.equal(0);
        });
      });
    }
  });
});
