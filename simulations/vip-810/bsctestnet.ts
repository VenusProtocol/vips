/**
 * =============================================================================
 * VIP-810 Test Suite - BNB Chain Testnet
 * =============================================================================
 *
 * Overview:
 * VIP-810 adds the U market to the Stablecoins e-mode pool on BNB Chain Testnet.
 * U is configured as a borrow-only asset with CF=0% and LT=0%, meaning it
 * cannot be used as collateral but can be borrowed against other stablecoins
 * in the pool.
 *
 * Test Structure:
 *
 * 1. Pre-VIP Behavior
 *    - Verifies Stablecoins e-mode pool (id=1) exists and is active
 *    - Confirms U market is not yet listed in the pool
 *
 * 2. VIP Execution
 *    - Executes VIP-810 proposal on testnet
 *    - Verifies emission of required events:
 *      * PoolMarketInitialized (1 event)
 *      * NewLiquidationIncentive (1 event)
 *      * BorrowAllowedUpdated (1 event)
 *
 * 3. Post-VIP Behavior
 *    - Verifies U market is correctly listed in Stablecoins e-mode pool
 *    - Validates market configuration:
 *      * isListed = true
 *      * marketPoolId = 1 (Stablecoins pool)
 *      * collateralFactor = 0% (borrow-only)
 *      * liquidationThreshold = 0%
 *      * liquidationIncentive = 1.0 (100%)
 *      * isBorrowAllowed = true
 *
 * Fork Block: 87217291
 *
 * Note: This is a lightweight testnet verification suite. Comprehensive
 * operational tests (basic operations, leverage strategies, core pool fallback)
 * are performed in the mainnet simulation suite.
 * =============================================================================
 */
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
