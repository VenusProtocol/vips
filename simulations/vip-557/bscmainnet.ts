import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriodInBinanceOracle } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import { vip554 } from "../../vips/vip-554/bscmainnet";
import { EMODE_POOL, vip557 } from "../../vips/vip-557/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const setStalePeriod = async (resilientOracle: Contract, redstoneOracle: Contract) => {
  const asBNB = "0x77734e70b6E88b4d82fE632a168EDf6e700912b6";
  const slisbnb = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
  const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
  await resilientOracle
    .connect(impersonatedTimelock)
    .setTokenConfig([
      asBNB,
      [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      [true, false, false],
      false,
    ]);
  await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(asBNB, parseUnits("1", 18));
  await resilientOracle
    .connect(impersonatedTimelock)
    .setTokenConfig([
      slisbnb,
      [bscmainnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
      [true, false, false],
      false,
    ]);
  await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(slisbnb, parseUnits("1", 18));
};

forking(64453350, async () => {
  let comptroller: Contract;
  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
    const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);
    await setStalePeriod(resilientOracle, redstoneOracle);
    await pretendExecutingVip(await vip554(), bscmainnet.NORMAL_TIMELOCK); // remove once vip-554 is exicuted
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bscmainnet.BINANCE_ORACLE, "WBETH", 315360000);
  });

  describe("Pre-VIP behavior", async () => {
    it("check new ETH Emode PoolId does not exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.lessThan(EMODE_POOL.id);
    });
  });

  testVip("VIP-557", await vip557(), {
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
          "PoolFallbackStatusUpdated",
        ],
        [1, 2, 1, 1, 2, 1, 1],
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
