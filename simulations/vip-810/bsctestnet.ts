import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { EMODE_POOL_SPECS, vU, vip810 } from "../../vips/vip-810/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const { bsctestnet } = NETWORK_ADDRESSES;
const provider = ethers.provider;

forking(87217291, async () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(bsctestnet.UNITROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("check that U market is not yet in the Stablecoins emode pool", async () => {
      // Pool id 1 should exist (Stablecoins pool)
      const pool = await comptroller.pools(EMODE_POOL_SPECS.id);
      expect(pool.isActive).to.equal(true);
      expect(pool.label).to.equal("Stablecoins");

      // But vU should not be listed in pool 1 yet
      const marketData = await comptroller.poolMarkets(EMODE_POOL_SPECS.id, vU);
      expect(marketData.isListed).to.equal(false);
    });
  });

  testVip("VIP-810 Add U market to Stablecoins emode pool", await vip810(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["PoolMarketInitialized", "NewLiquidationIncentive", "BorrowAllowedUpdated"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("should have U market listed in Stablecoins emode pool with correct configuration", async () => {
      const marketData = await comptroller.poolMarkets(EMODE_POOL_SPECS.id, vU);

      expect(marketData.isListed).to.equal(true);
      expect(marketData.marketPoolId).to.equal(EMODE_POOL_SPECS.id);
      expect(marketData.collateralFactorMantissa).to.equal(EMODE_POOL_SPECS.marketsConfig.vU.collateralFactor);
      expect(marketData.liquidationThresholdMantissa).to.equal(EMODE_POOL_SPECS.marketsConfig.vU.liquidationThreshold);
      expect(marketData.liquidationIncentiveMantissa).to.equal(EMODE_POOL_SPECS.marketsConfig.vU.liquidationIncentive);
      expect(marketData.isBorrowAllowed).to.equal(EMODE_POOL_SPECS.marketsConfig.vU.borrowAllowed);
    });
  });
});
