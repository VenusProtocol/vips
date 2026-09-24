import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { EMODE_POOL, vip667 } from "../../vips/vip-667/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(132849860, async () => {
  let comptroller: Contract;
  before(async () => {
    comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    await setMaxStalePeriodInBinanceOracle(bsctestnet.BINANCE_ORACLE, "WBETH", 315360000);
  });

  describe("Pre-VIP behavior", async () => {
    it("new ETH emode pool gets the expected id", async () => {
      expect(await comptroller.lastPoolId()).to.equal(EMODE_POOL.id - 1);
    });
  });

  testVip("VIP-667", await vip667(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "PoolCreated",
          "PoolMarketInitialized",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
        ],
        [1, 2, 1, 1, 2, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("should update lastPoolId to the new pool", async () => {
      expect(await comptroller.lastPoolId()).to.equals(EMODE_POOL.id);
    });

    it("should set the newly created pool as active with correct config", async () => {
      const newPool = await comptroller.pools(EMODE_POOL.id);
      expect(newPool.label).to.equals(EMODE_POOL.label);
      expect(newPool.isActive).to.equals(true);
      expect(newPool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);
    });

    it("should set the correct risk parameters to all pool markets", async () => {
      for (const config of Object.values(EMODE_POOL.marketsConfig)) {
        const marketData = await comptroller.poolMarkets(EMODE_POOL.id, config.address);
        expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
        expect(marketData.isListed).to.be.equal(true);
        expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
        expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
        expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
        expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
      }
    });
  });
});
