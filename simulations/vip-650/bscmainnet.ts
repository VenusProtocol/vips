import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip650, {
  BOUND_VALIDATOR,
  NEW_ORACLE_CONFIG,
  NEW_REDSTONE_ORACLE_FEEDS,
  NEW_STANDARD_ORACLE_CONFIG,
  NEW_TWT_ORACLE_CONFIG,
  OLD_ORACLE_CONFIG,
  PRICE_LOWER_BOUND,
  PRICE_UPPER_BOUND,
} from "../../vips/vip-650/bscmainnet";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const addressZero = ethers.constants.AddressZero;

forking(80964126, async () => {
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  const preVipPrices: Record<string, any> = {};

  let boundValidator: Contract;

  before(async () => {
    redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("has no RedStone feed configured for assets to be added", async () => {
      for (const { ASSET } of NEW_REDSTONE_ORACLE_FEEDS) {
        const cfg = await redstoneOracle.tokenConfigs(ASSET);
        expect(cfg.asset).to.equal(addressZero);
      }
    });

    it("has resilient oracle configs matching old config for all assets", async () => {
      for (const oldConfig of OLD_ORACLE_CONFIG) {
        const cfg = await resilientOracle.getTokenConfig(oldConfig.ASSET);

        expect(cfg.asset).to.equal(oldConfig.ASSET);
        expect(cfg.oracles[0]).to.equal(oldConfig.MAIN);
        expect(cfg.oracles[1]).to.equal(oldConfig.PIVOT);
        expect(cfg.oracles[2]).to.equal(oldConfig.FALLBACK);
        expect(cfg.cachingEnabled).to.equal(oldConfig.CACHED);
      }
    });

    it("stores current resilient oracle prices for all assets", async () => {
      for (const { ASSET } of NEW_ORACLE_CONFIG) {
        const price = await resilientOracle.getPrice(ASSET);
        preVipPrices[ASSET] = price;
      }
    });
  });

  testVip("VIP-650 bscmainnet", await vip650(), {
    callbackAfterExecution: async txResponse => {
      const totalTokenConfigAdded = NEW_REDSTONE_ORACLE_FEEDS.length + NEW_ORACLE_CONFIG.length;
      await expectEvents(
        txResponse,
        [CHAINLINK_ORACLE_ABI, RESILIENT_ORACLE_ABI],
        ["TokenConfigAdded", "TokenConfigAdded"],
        [totalTokenConfigAdded, totalTokenConfigAdded],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("sets expected RedStone oracle feeds", async () => {
      for (const { ASSET, FEED, MAX_STALE_PERIOD } of NEW_REDSTONE_ORACLE_FEEDS) {
        const cfg = await redstoneOracle.tokenConfigs(ASSET);
        expect(cfg.asset).to.equal(ASSET);
        expect(cfg.feed).to.equal(FEED);
        expect(cfg.maxStalePeriod).to.equal(MAX_STALE_PERIOD);
      }
    });

    it("sets expected resilient oracle config for all assets", async () => {
      for (const oracleConfig of NEW_ORACLE_CONFIG) {
        const cfg = await resilientOracle.getTokenConfig(oracleConfig.ASSET);

        const expectedOracles = [oracleConfig.MAIN, oracleConfig.PIVOT, oracleConfig.FALLBACK];

        expect(cfg.asset).to.equal(oracleConfig.ASSET);
        expect(cfg.oracles[0]).to.equal(expectedOracles[0]);
        expect(cfg.oracles[1]).to.equal(expectedOracles[1]);
        expect(cfg.oracles[2]).to.equal(expectedOracles[2]);

        expect(cfg.enableFlagsForOracles[0]).to.equal(expectedOracles[0] !== addressZero);
        expect(cfg.enableFlagsForOracles[1]).to.equal(expectedOracles[1] !== addressZero);
        expect(cfg.enableFlagsForOracles[2]).to.equal(expectedOracles[2] !== addressZero);

        expect(cfg.cachingEnabled).to.equal(oracleConfig.CACHED);
      }
    });

    it("sets BoundValidator config for TWT", async () => {
      const cfg = await boundValidator.validateConfigs(NEW_TWT_ORACLE_CONFIG.ASSET);
      expect(cfg.upperBoundRatio).to.equal(PRICE_UPPER_BOUND);
      expect(cfg.lowerBoundRatio).to.equal(PRICE_LOWER_BOUND);
    });

    it("keeps resilient oracle prices unchanged for all assets", async () => {
      // Standard assets: extend stale periods for RedStone, Chainlink, and Binance
      for (const { ASSET, NAME } of NEW_STANDARD_ORACLE_CONFIG) {
        await setMaxStalePeriodInChainlinkOracle(
          bscmainnet.REDSTONE_ORACLE,
          ASSET,
          ethers.constants.AddressZero,
          bscmainnet.NORMAL_TIMELOCK,
          315360000,
        );
        await setMaxStalePeriodInChainlinkOracle(
          bscmainnet.CHAINLINK_ORACLE,
          ASSET,
          ethers.constants.AddressZero,
          bscmainnet.NORMAL_TIMELOCK,
          315360000,
        );
        await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, NAME, 315360000);
      }

      // TWT: extend stale periods for RedStone and Binance (no Chainlink feed)
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.REDSTONE_ORACLE,
        NEW_TWT_ORACLE_CONFIG.ASSET,
        ethers.constants.AddressZero,
        bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, NEW_TWT_ORACLE_CONFIG.NAME, 315360000);

      // Set direct price on RedStone oracle for TWT using the pre-VIP Binance price.
      // This bypasses the feed staleness check that occurs in the fork simulation
      // (the VIP execution advances time ~72h past the feed's last update).
      const oracleAdmin = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1.0"));
      await redstoneOracle
        .connect(oracleAdmin)
        .setDirectPrice(NEW_TWT_ORACLE_CONFIG.ASSET, preVipPrices[NEW_TWT_ORACLE_CONFIG.ASSET]);

      // Verify prices haven't deviated significantly
      for (const { NAME, ASSET } of NEW_ORACLE_CONFIG) {
        const priceAfter = await resilientOracle.getPrice(ASSET);
        const priceBefore = preVipPrices[ASSET];
        const diff = priceAfter.sub(priceBefore);
        const diffPct = `${(Number(diff.mul(10000).div(priceBefore)) / 100).toFixed(2)}%`;
        console.log(`${NAME}: difference = ${diff.toString()} (${diffPct})`);
        const tolerance = priceBefore.mul(3).div(100); // allow 3% difference
        expect(priceAfter).to.be.closeTo(priceBefore, tolerance);
      }
    });
  });
});
