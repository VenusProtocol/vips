import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { CORE_MARKETS } from "../../vips/vip-547/bsctestnet";
import { EMODE_POOLS as EMODE_POOLS_PART1, vip800 } from "../../vips/vip-800/bsctestnet";
import { EMODE_POOLS, vip800 as vip800Bsctestnet2 } from "../../vips/vip-800/bsctestnet-2";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(85524987, async () => {
  let comptroller: Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, provider);

    for (const market of CORE_MARKETS) {
      // Call function with default feed = AddressZero (so it fetches from oracle.tokenConfigs)
      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
        market.asset,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
        315360000,
      );

      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bsctestnet.REDSTONE_ORACLE,
        market.asset,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
        315360000,
      );
    }
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bsctestnet.BINANCE_ORACLE, "WBETH", 315360000);
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bsctestnet.BINANCE_ORACLE, "TWT", 315360000);
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bsctestnet.BINANCE_ORACLE, "lisUSD", 315360000);
  });

  describe("Pre-VIP behavior", async () => {
    it("check new Emode PoolId does not exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.lessThan(EMODE_POOLS[EMODE_POOLS.length - 1].id);
    });
  });

  testVip("VIP-800 Part-1", await vip800(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
          "PoolCreated",
          "PoolMarketInitialized",
          "PoolFallbackStatusUpdated",
        ],
        [18, 18, 18, 18, 6, 18, 6],
      );
    },
  });

  testVip("VIP-800 Part-2", await vip800Bsctestnet2(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
          "PoolCreated",
          "PoolMarketInitialized",
          "PoolFallbackStatusUpdated",
        ],
        [6, 6, 6, 6, 2, 6, 2],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should update lastPoolId to the new pool", async () => {
      expect(await comptroller.lastPoolId()).to.equals(EMODE_POOLS[EMODE_POOLS.length - 1].id);
    });

    // Verify Part-1 pools remain correctly configured after Part-2
    for (const EMODE_POOL of EMODE_POOLS_PART1) {
      describe(`Part-1 Emode Pool ${EMODE_POOL.label}`, () => {
        it("should still be active with correct label, fallback, and risk parameters for all markets", async () => {
          const marketEntries = Object.entries(EMODE_POOL.marketsConfig);
          const [pool, ...marketDataResults] = await Promise.all([
            comptroller.pools(EMODE_POOL.id),
            ...marketEntries.map(([, config]) => comptroller.poolMarkets(EMODE_POOL.id, config.address)),
          ]);
          expect(pool.label).to.equals(EMODE_POOL.label);
          expect(pool.isActive).to.equals(true);
          expect(pool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);

          for (let i = 0; i < marketEntries.length; i++) {
            const [, config] = marketEntries[i];
            const marketData = marketDataResults[i];
            expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
            expect(marketData.isListed).to.be.equal(true);
            expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
            expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
            expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
            expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
          }
        });
      });
    }

    // Verify Part-2 pools
    for (const EMODE_POOL of EMODE_POOLS) {
      describe(`Part-2 Emode Pool ${EMODE_POOL.label}`, () => {
        it("should set the newly created pool as active with correct label and risk parameters for all markets", async () => {
          const marketEntries = Object.entries(EMODE_POOL.marketsConfig);
          const [newPool, ...marketDataResults] = await Promise.all([
            comptroller.pools(EMODE_POOL.id),
            ...marketEntries.map(([, config]) => comptroller.poolMarkets(EMODE_POOL.id, config.address)),
          ]);
          expect(newPool.label).to.equals(EMODE_POOL.label);
          expect(newPool.isActive).to.equals(true);
          expect(newPool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);

          for (let i = 0; i < marketEntries.length; i++) {
            const [, config] = marketEntries[i];
            const marketData = marketDataResults[i];
            expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
            expect(marketData.isListed).to.be.equal(true);
            expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
            expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
            expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
            expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
          }
        });
      });
    }
  });
});
