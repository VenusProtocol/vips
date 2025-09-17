import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { POOL_SPECS, UNITROLLER, vip545 } from "../../vips/vip-545/bsctestnet-stablecoins";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

forking(65570708, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
  });

  describe("Pre-VIP state", async () => {
    it("check the new poolId does not exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.lessThan(POOL_SPECS.id);
    });
  });

  testVip("VIP-545", await vip545(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        [
          "PoolCreated",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "PoolMarketInitialized",
        ],
        [1, 1, 1, 2, 2],
      );
    },
  });

  describe("Post-VIP state", async () => {
    it("should update lastPoolId to the new pool", async () => {
      expect(await comptroller.lastPoolId()).to.equals(POOL_SPECS.id);
    });

    it("should set the newly created pool as active with correct label", async () => {
      const newPool = await comptroller.pools(POOL_SPECS.id);
      expect(newPool.label).to.equals(POOL_SPECS.label);
      expect(newPool.isActive).to.equals(true);
    });

    it("should set the correct risk parameters to all pool markets", async () => {
      for (const market of POOL_SPECS.marketsConfig) {
        const marketData = await comptroller.poolMarkets(POOL_SPECS.id, market.address);
        expect(marketData.marketPoolId).to.be.equal(POOL_SPECS.id);
        expect(marketData.isListed).to.be.equal(true);
        expect(marketData.collateralFactorMantissa).to.be.equal(market.collateralFactor);
        expect(marketData.liquidationThresholdMantissa).to.be.equal(market.liquidationThreshold);
        expect(marketData.liquidationIncentiveMantissa).to.be.equal(market.liquidationIncentive);
        expect(marketData.isBorrowAllowed).to.be.equal(market.borrowAllowed);
      }
    });
  });
});
