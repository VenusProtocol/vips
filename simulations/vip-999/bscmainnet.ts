import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip999, {
  BINANCE_STALE_PERIODS,
  CAPO_GROWTH_RATE_CONFIGS,
  CHAINLINK_ORACLE_CONFIGS,
  ORACLE_PRICE_VALIDATION_ASSETS,
  REDSTONE_ORACLE_CONFIGS,
  SUSDE_ORACLE_CONFIG,
  TOKENS,
  USDT_CHAINLINK_ORACLE,
  USDT_CHAINLINK_ORACLE_CONFIG,
  asBNB_ORACLE,
  sUSDe,
  slisBNB_ORACLE,
} from "../../vips/vip-999/bscmainnet";
import CAPPED_ORACLE_ABI from "./abi/CappedOracle.json";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import REDSTONE_ORACLE_ABI from "./abi/redstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const BLOCK_NUMBER = 87272909;
const SECONDS_PER_YEAR = 31_536_000;
const PRICE_CHANGE_TOLERANCE_BPS = 300; // 3%
const STALE_PERIOD_OVERRIDE = 315_360_000; // 10 years

const annualizedRateToPerSecond = (annualizedRate: BigNumber) => annualizedRate.div(SECONDS_PER_YEAR);
const bpsToRatio = (value: BigNumber, bps: number) => value.mul(bps).div(10_000);

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let chainlinkOracle: Contract;
  let redstoneOracle: Contract;
  let binanceOracle: Contract;
  let usdtChainlinkOracle: Contract;
  let asBNBOracleContract: Contract;
  let slisBNBOracleContract: Contract;
  const preVipPrices: Record<string, BigNumber> = {};
  const chainlinkConfigs = Object.values(CHAINLINK_ORACLE_CONFIGS);
  const redstoneConfigs = Object.values(REDSTONE_ORACLE_CONFIGS);
  const binanceStalePeriods = Object.values(BINANCE_STALE_PERIODS);

  before(async () => {
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    chainlinkOracle = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, provider);
    binanceOracle = new ethers.Contract(bscmainnet.BINANCE_ORACLE, BINANCE_ORACLE_ABI, provider);
    usdtChainlinkOracle = new ethers.Contract(USDT_CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    asBNBOracleContract = new ethers.Contract(asBNB_ORACLE, CAPPED_ORACLE_ABI, provider);
    slisBNBOracleContract = new ethers.Contract(slisBNB_ORACLE, CAPPED_ORACLE_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("should match pre-VIP sUSDe oracle config", async () => {
      const tokenConfig = await resilientOracle.getTokenConfig(sUSDe);
      expect(tokenConfig.oracles[0]).to.equal(SUSDE_ORACLE_CONFIG.old.oracles[0]);
      expect(tokenConfig.oracles[1]).to.equal(SUSDE_ORACLE_CONFIG.old.oracles[1]);
      expect(tokenConfig.oracles[2]).to.equal(SUSDE_ORACLE_CONFIG.old.oracles[2]);
      expect(tokenConfig.enableFlagsForOracles[0]).to.equal(SUSDE_ORACLE_CONFIG.old.enableFlagsForOracles[0]);
      expect(tokenConfig.enableFlagsForOracles[1]).to.equal(SUSDE_ORACLE_CONFIG.old.enableFlagsForOracles[1]);
      expect(tokenConfig.enableFlagsForOracles[2]).to.equal(SUSDE_ORACLE_CONFIG.old.enableFlagsForOracles[2]);
      expect(tokenConfig.cachingEnabled).to.equal(SUSDE_ORACLE_CONFIG.old.cachingEnabled);
    });

    it("should match pre-VIP maxStalePeriod values for Chainlink feeds", async () => {
      for (const { asset, feed, oldMaxStalePeriod } of chainlinkConfigs) {
        const config = await chainlinkOracle.tokenConfigs(asset);
        expect(config.feed).to.equal(feed);
        expect(config.maxStalePeriod).to.equal(oldMaxStalePeriod);
      }
    });

    it("should match pre-VIP maxStalePeriod for USDe Main ChainlinkOracle", async () => {
      const config = await usdtChainlinkOracle.tokenConfigs(TOKENS.USDe);
      expect(config.feed).to.equal(USDT_CHAINLINK_ORACLE_CONFIG.USDe.feed);
      expect(config.maxStalePeriod).to.equal(USDT_CHAINLINK_ORACLE_CONFIG.USDe.oldMaxStalePeriod);
    });

    it("should match pre-VIP maxStalePeriod values for RedStone feeds", async () => {
      for (const { asset, feed, oldMaxStalePeriod } of redstoneConfigs) {
        const config = await redstoneOracle.tokenConfigs(asset);
        expect(config.feed).to.equal(feed);
        expect(config.maxStalePeriod).to.equal(oldMaxStalePeriod);
      }
    });

    it("should match pre-VIP maxStalePeriod values for Binance symbols", async () => {
      for (const { symbol, oldMaxStalePeriod } of binanceStalePeriods) {
        const stalePeriod = await binanceOracle.maxStalePeriod(symbol);
        expect(stalePeriod).to.equal(oldMaxStalePeriod);
      }
    });

    it("should match pre-VIP CAPO growth rates", async () => {
      const asBNBGrowthRate = await asBNBOracleContract.growthRatePerSecond();
      const slisBNBGrowthRate = await slisBNBOracleContract.growthRatePerSecond();

      expect(asBNBGrowthRate).to.equal(annualizedRateToPerSecond(CAPO_GROWTH_RATE_CONFIGS.asBNB.growthRatePerYear.old));
      expect(slisBNBGrowthRate).to.equal(
        annualizedRateToPerSecond(CAPO_GROWTH_RATE_CONFIGS.slisBNB.growthRatePerYear.old),
      );
    });

    it("should cache pre-VIP resilient oracle prices for all validation assets", async () => {
      for (const asset of ORACLE_PRICE_VALIDATION_ASSETS) {
        const price = await resilientOracle.getPrice(asset);
        expect(price, `Pre-VIP price unavailable for ${asset}`).to.be.gt(0);
        preVipPrices[asset] = price;
      }
    });
  });

  testVip("VIP-999 [BNB Chain] Oracle Configuration Update — Core Pool", await vip999(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded", "CachedEnabled"], [1, 1]);
      await expectEvents(
        txResponse,
        [CHAINLINK_ORACLE_ABI],
        ["TokenConfigAdded"],
        [chainlinkConfigs.length + 1 + redstoneConfigs.length], // +1 for USDT ChainlinkOracle (USDe Main),
      );

      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["MaxStalePeriodAdded"], [binanceStalePeriods.length]);
      await expectEvents(txResponse, [CAPPED_ORACLE_ABI], ["GrowthRateUpdated"], [2]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    describe("maxStalePeriod Configuration", () => {
      it("should match post-VIP maxStalePeriod values for Chainlink feeds", async () => {
        for (const { asset, feed, newMaxStalePeriod } of chainlinkConfigs) {
          const config = await chainlinkOracle.tokenConfigs(asset);
          expect(config.feed).to.equal(feed);
          expect(config.maxStalePeriod).to.equal(newMaxStalePeriod);
        }
      });

      it("should match post-VIP maxStalePeriod for USDe Main ChainlinkOracle", async () => {
        const config = await usdtChainlinkOracle.tokenConfigs(TOKENS.USDe);
        expect(config.feed).to.equal(USDT_CHAINLINK_ORACLE_CONFIG.USDe.feed);
        expect(config.maxStalePeriod).to.equal(USDT_CHAINLINK_ORACLE_CONFIG.USDe.newMaxStalePeriod);
      });

      it("should match post-VIP maxStalePeriod values for RedStone feeds", async () => {
        for (const { asset, feed, newMaxStalePeriod } of redstoneConfigs) {
          const config = await redstoneOracle.tokenConfigs(asset);
          expect(config.feed).to.equal(feed);
          expect(config.maxStalePeriod).to.equal(newMaxStalePeriod);
        }
      });

      it("should match post-VIP maxStalePeriod values for Binance symbols", async () => {
        for (const { symbol, newMaxStalePeriod } of binanceStalePeriods) {
          const stalePeriod = await binanceOracle.maxStalePeriod(symbol);
          expect(stalePeriod).to.equal(newMaxStalePeriod);
        }
      });
    });

    describe("sUSDe Oracle Configuration", () => {
      it("should match post-VIP sUSDe oracle config", async () => {
        const tokenConfig = await resilientOracle.getTokenConfig(sUSDe);
        expect(tokenConfig.oracles[0]).to.equal(SUSDE_ORACLE_CONFIG.new.oracles[0]);
        expect(tokenConfig.oracles[1]).to.equal(SUSDE_ORACLE_CONFIG.new.oracles[1]);
        expect(tokenConfig.oracles[2]).to.equal(SUSDE_ORACLE_CONFIG.new.oracles[2]);
        expect(tokenConfig.enableFlagsForOracles[0]).to.equal(SUSDE_ORACLE_CONFIG.new.enableFlagsForOracles[0]);
        expect(tokenConfig.enableFlagsForOracles[1]).to.equal(SUSDE_ORACLE_CONFIG.new.enableFlagsForOracles[1]);
        expect(tokenConfig.enableFlagsForOracles[2]).to.equal(SUSDE_ORACLE_CONFIG.new.enableFlagsForOracles[2]);
        expect(tokenConfig.cachingEnabled).to.equal(SUSDE_ORACLE_CONFIG.new.cachingEnabled);
      });
    });

    describe("CAPO Growth Rate Configuration", () => {
      it("should have asBNB snapshot interval set to 30 days", async () => {
        const snapshotInterval = await asBNBOracleContract.snapshotInterval();
        expect(snapshotInterval).to.equal(CAPO_GROWTH_RATE_CONFIGS.asBNB.snapshotInterval.new);
      });

      it("should have slisBNB snapshot interval set to 30 days", async () => {
        const snapshotInterval = await slisBNBOracleContract.snapshotInterval();
        expect(snapshotInterval).to.equal(CAPO_GROWTH_RATE_CONFIGS.slisBNB.snapshotInterval.new);
      });

      it("should have asBNB growth rate updated", async () => {
        const growthRate = await asBNBOracleContract.growthRatePerSecond();
        expect(growthRate).to.equal(annualizedRateToPerSecond(CAPO_GROWTH_RATE_CONFIGS.asBNB.growthRatePerYear.new));
      });

      it("should have slisBNB growth rate updated", async () => {
        const growthRate = await slisBNBOracleContract.growthRatePerSecond();
        expect(growthRate).to.equal(annualizedRateToPerSecond(CAPO_GROWTH_RATE_CONFIGS.slisBNB.growthRatePerYear.new));
      });
    });

    describe("Resilient Oracle price validation", () => {
      it("should keep post-VIP prices within tolerance for all validation assets", async () => {
        const oracleAdmin = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1.0"));
        // The testVip helper advances time past timelock delays, so current feed data can
        // look stale in forked simulations. Temporarily relax stale windows for validation.
        for (const [symbol, asset] of Object.entries(TOKENS)) {
          await setMaxStalePeriodInChainlinkOracle(
            bscmainnet.CHAINLINK_ORACLE,
            asset,
            ethers.constants.AddressZero,
            bscmainnet.NORMAL_TIMELOCK,
            STALE_PERIOD_OVERRIDE,
          );

          await setMaxStalePeriodInChainlinkOracle(
            bscmainnet.REDSTONE_ORACLE,
            asset,
            ethers.constants.AddressZero,
            bscmainnet.NORMAL_TIMELOCK,
            STALE_PERIOD_OVERRIDE,
          );

          await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, symbol, STALE_PERIOD_OVERRIDE);

          // Token-specific oracle routes used in resilient configs
          if (symbol === "USDe") {
            await setMaxStalePeriodInChainlinkOracle(
              USDT_CHAINLINK_ORACLE,
              asset,
              ethers.constants.AddressZero,
              bscmainnet.NORMAL_TIMELOCK,
              STALE_PERIOD_OVERRIDE,
            );
          }
          // feed has statePeriod fixed to 72 hour, so we need to set a price directly in the RedStone Oracle to prevent staleness
          if (symbol === "TWT" || symbol === "SolvBTC" || symbol === "THE") {
            await redstoneOracle.connect(oracleAdmin).setDirectPrice(asset, preVipPrices[asset]);
          }
        }

        for (const asset of ORACLE_PRICE_VALIDATION_ASSETS) {
          const preVipPrice = preVipPrices[asset];
          const postVipPrice = await resilientOracle.getPrice(asset);
          expect(postVipPrice, `Post-VIP price unavailable for ${asset}`).to.be.gt(0);
          const priceDelta = preVipPrice.gt(postVipPrice)
            ? preVipPrice.sub(postVipPrice)
            : postVipPrice.sub(preVipPrice);
          const maxAllowedDelta = bpsToRatio(preVipPrice, PRICE_CHANGE_TOLERANCE_BPS);

          expect(
            priceDelta.lte(maxAllowedDelta),
            `Price moved more than ${PRICE_CHANGE_TOLERANCE_BPS} bps for ${asset}: pre=${preVipPrice.toString()} post=${postVipPrice.toString()}`,
          ).to.be.true;
        }
      });
    });
  });
});
