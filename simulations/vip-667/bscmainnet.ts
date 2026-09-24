import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import ERC20_ABI from "../../src/vip-framework/abi/erc20.json";
import RESILIENT_ORACLE_ABI from "../../src/vip-framework/abi/resilientOracle.json";
import { EMODE_POOL, vip667 } from "../../vips/vip-667/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const WBETH = "0xa2E3356610840701BDf5611a53974510Ae27E2e1";

forking(123704678, async () => {
  let comptroller: Contract;
  before(async () => {
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, ethers.provider);
    const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    // WBETH is priced off ETH; keep both fresh past the voting + timelock warp
    for (const asset of [ETH, WBETH]) {
      await setMaxStalePeriod(resilientOracle, new ethers.Contract(asset, ERC20_ABI, ethers.provider));
    }
  });

  describe("Pre-VIP behavior", async () => {
    it("new ETH emode pool gets the expected id", async () => {
      expect(await comptroller.lastPoolId()).to.equal(EMODE_POOL.id - 1);
    });
  });

  // default proposer Safe (0x3422…) has proposal 663 live at this block
  testVip("VIP-667", await vip667(), {
    proposer: "0xe5e62386933b74ea81bfd73a6a6591598e7f8ced",
    supporters: ["0x5176671de05380379399b669ed276feec99d59cb"],
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
