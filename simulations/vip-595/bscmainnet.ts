import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
  setRedstonePrice,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip595, {
  FLUX_CAMPAIGN_USDT_AMOUNT,
  NEW_CHAINLINK_ORACLE_CONFIG,
  NEW_ORACLE_CONFIG,
  NEW_ORACLE_CONFIG_FOR_RS_CHANGES,
  NEW_REDSTONE_ORACLE_FEEDS,
  OLD_ORACLE_CONFIG,
  OLD_ORACLE_CONFIG_FOR_RS_CHANGES,
  OLD_REDSTONE_ORACLE_FEEDS,
  SAFE_ACCOUNT,
  USDT_BSC,
} from "../../vips/vip-595/bscmainnet";
import ERC20_ABI from "../vip-595/abi/ERC20.json";
import CHAINLINK_ORACLE_ABI from "../vip-595/abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "../vip-595/abi/resilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const addressZero = ethers.constants.AddressZero;

forking(78096227, async () => {
  let chainlinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let usdt: Contract;
  const preVipPrices: Record<string, any> = {};
  const preVipPricesRS: Record<string, any> = {};
  let safeAccountBalanceBefore: BigNumber;

  before(async () => {
    chainlinkOracle = new ethers.Contract(bscmainnet.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, ethers.provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    usdt = new Contract(USDT_BSC, ERC20_ABI, ethers.provider);
    safeAccountBalanceBefore = await usdt.balanceOf(SAFE_ACCOUNT);

    await setRedstonePrice(
      bscmainnet.REDSTONE_ORACLE,
      "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB
      "0xa51738d1937FFc553d5070f43300B385AA2D9F55", // Red stone for BTC/USD
      bscmainnet.NORMAL_TIMELOCK,
    );
  });

  describe("Pre-VIP behavior", async () => {
    describe("Chainlink", async () => {
      it("has different Chainlink feeds for assets to be updated", async () => {
        for (const { NAME, ASSET, FEED, MAX_STALE_PERIOD } of NEW_CHAINLINK_ORACLE_CONFIG) {
          const cfg = await chainlinkOracle.tokenConfigs(ASSET);
          expect(cfg.asset).to.equal(ASSET);
          expect(cfg.feed).to.not.equal(FEED);
          if (NAME != "BTCB")
            // BTCB has same MAX_STALE_PERIOD = 100
            expect(cfg.maxStalePeriod).to.not.equal(MAX_STALE_PERIOD);
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

      it("stores current resilient oracle prices for all assets to be updated", async () => {
        for (const { ASSET } of NEW_ORACLE_CONFIG) {
          const price = await resilientOracle.getPrice(ASSET);
          preVipPrices[ASSET] = price;
        }
      });
    });

    describe("Redstone", async () => {
      it("has no Redstone feed for assets to be added", async () => {
        for (const { ASSET } of NEW_REDSTONE_ORACLE_FEEDS) {
          const cfg = await redstoneOracle.tokenConfigs(ASSET);
          expect(cfg.asset).to.equal(addressZero);
        }
      });

      it("check current redstone oracle Feeds", async () => {
        for (const { ASSET, FEED, MAX_STALE_PERIOD } of OLD_REDSTONE_ORACLE_FEEDS) {
          const cfg = await redstoneOracle.tokenConfigs(ASSET);
          expect(cfg.asset).to.equal(ASSET);
          expect(cfg.feed).to.equal(FEED);
          expect(cfg.maxStalePeriod).to.equal(MAX_STALE_PERIOD);
        }
      });

      it("check current resilient oracle config", async () => {
        for (const oldConfig of OLD_ORACLE_CONFIG_FOR_RS_CHANGES) {
          const cfg = await resilientOracle.getTokenConfig(oldConfig.ASSET);

          expect(cfg.asset).to.equal(oldConfig.ASSET);
          expect(cfg.oracles[0]).to.equal(oldConfig.MAIN);
          expect(cfg.oracles[1]).to.equal(oldConfig.PIVOT);
          expect(cfg.oracles[2]).to.equal(oldConfig.FALLBACK);
          expect(cfg.cachingEnabled).to.equal(oldConfig.CACHED);
        }
      });

      it("stores current resilient oracle prices for affected assets", async () => {
        for (const { ASSET } of NEW_ORACLE_CONFIG_FOR_RS_CHANGES) {
          const price = await resilientOracle.getPrice(ASSET);
          preVipPricesRS[ASSET] = price;
        }
      });
    });
  });

  testVip("VIP-595 bscmainnet", await vip595(), {
    callbackAfterExecution: async txResponse => {
      const totalTokenConfigAdded =
        NEW_CHAINLINK_ORACLE_CONFIG.length +
        NEW_REDSTONE_ORACLE_FEEDS.length +
        NEW_ORACLE_CONFIG_FOR_RS_CHANGES.length +
        1; // NEW_BTCB_ORACLE_CONFIG
      await expectEvents(
        txResponse,
        [CHAINLINK_ORACLE_ABI, RESILIENT_ORACLE_ABI],
        ["TokenConfigAdded", "TokenConfigAdded"],
        [totalTokenConfigAdded, totalTokenConfigAdded],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("Chainlink", async () => {
      it("sets expected Chainlink oracle configs", async () => {
        for (const { ASSET, FEED, MAX_STALE_PERIOD } of NEW_CHAINLINK_ORACLE_CONFIG) {
          const cfg = await chainlinkOracle.tokenConfigs(ASSET);
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

      it("keeps resilient oracle prices unchanged for all updated assets", async () => {
        for (const { ASSET, NAME } of NEW_ORACLE_CONFIG) {
          // Call function with default feed = AddressZero (so it fetches from oracle.tokenConfigs)
          await setMaxStalePeriodInChainlinkOracle(
            bscmainnet.CHAINLINK_ORACLE,
            ASSET,
            ethers.constants.AddressZero,
            bscmainnet.NORMAL_TIMELOCK,
            315360000,
          );

          await setMaxStalePeriodInChainlinkOracle(
            bscmainnet.REDSTONE_ORACLE,
            ASSET,
            ethers.constants.AddressZero,
            bscmainnet.NORMAL_TIMELOCK,
            315360000,
          );
          await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, NAME, 315360000);
        }

        for (const { ASSET } of NEW_ORACLE_CONFIG) {
          const priceAfter = await resilientOracle.getPrice(ASSET);
          const priceBefore = preVipPrices[ASSET];
          const tolerance = priceBefore.mul(1).div(100); // allow 1% difference
          expect(priceAfter).to.be.closeTo(priceBefore, tolerance);
        }
      });
    });
  });

  describe("Redstone", async () => {
    it("sets expected Redstone oracle Feeds", async () => {
      for (const { ASSET, FEED, MAX_STALE_PERIOD } of NEW_REDSTONE_ORACLE_FEEDS) {
        const cfg = await redstoneOracle.tokenConfigs(ASSET);
        expect(cfg.asset).to.equal(ASSET);
        expect(cfg.feed).to.equal(FEED);
        expect(cfg.maxStalePeriod).to.equal(MAX_STALE_PERIOD);
      }
    });

    it("sets expected resilient oracle config for Redstone-changed assets", async () => {
      for (const oracleConfig of NEW_ORACLE_CONFIG_FOR_RS_CHANGES) {
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

    it("keeps resilient oracle prices unchanged for all affected assets", async () => {
      // NEW_ORACLE_CONFIG_FOR_RS_CHANGES ⊇ NEW_REDSTONE_ORACLE_FEEDS
      for (const { ASSET, NAME } of NEW_ORACLE_CONFIG_FOR_RS_CHANGES) {
        await setMaxStalePeriodInChainlinkOracle(
          bscmainnet.CHAINLINK_ORACLE,
          ASSET,
          ethers.constants.AddressZero,
          bscmainnet.NORMAL_TIMELOCK,
          315360000,
        );

        await setMaxStalePeriodInChainlinkOracle(
          bscmainnet.REDSTONE_ORACLE,
          ASSET,
          ethers.constants.AddressZero,
          bscmainnet.NORMAL_TIMELOCK,
          315360000,
        );
        await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, NAME, 315360000);
      }

      for (const { NAME, ASSET } of NEW_ORACLE_CONFIG_FOR_RS_CHANGES) {
        const priceAfter = await resilientOracle.getPrice(ASSET);
        const priceBefore = preVipPricesRS[ASSET];
        const diff = priceAfter.sub(priceBefore);
        const diffPct = `${(Number(diff.mul(10000).div(priceBefore)) / 100).toFixed(2)}%`;
        console.log(`${NAME}: difference = ${diff.toString()} (${diffPct})`);
        const tolerance = priceBefore.mul(3).div(100); // allow 3% difference
        expect(priceAfter).to.be.closeTo(priceBefore, tolerance);
      }
    });
  });

  describe("Fund Withdrawal from Tresury", async () => {
    it("check SAFE_ACCOUNT USDT balance", async () => {
      const certikBalanceAfter = await usdt.balanceOf(SAFE_ACCOUNT);
      expect(certikBalanceAfter).to.equal(safeAccountBalanceBefore.add(FLUX_CAMPAIGN_USDT_AMOUNT));
    });
  });
});
