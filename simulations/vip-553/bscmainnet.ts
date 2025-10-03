import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle, setRedstonePrice } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { EMODE_POOL, vip553 } from "../../vips/vip-553/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const setStalePeriod = async () => {
  const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
  const SolvBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
  const xSolvBTC = "0x1346b618dC92810EC74163e4c27004c921D446a5";
  const xSolvBTC_RedStone_Feed = "0x24c8964338Deb5204B096039147B8e8C3AEa42Cc";

  await setRedstonePrice(bscmainnet.REDSTONE_ORACLE, xSolvBTC, xSolvBTC_RedStone_Feed, bscmainnet.NORMAL_TIMELOCK);

  for (const asset of [BTCB, SolvBTC]) {
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
      asset,
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );
  }
};

forking(63324983, async () => {
  let comptroller: Contract;

  before(async () => {
    const provider = ethers.provider;
    await setStalePeriod();
    comptroller = new ethers.Contract(bscmainnet.UNITROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check new BTC Emode PoolId does not exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.lessThan(EMODE_POOL.id);
    });
  });

  testVip("VIP-553", await vip553(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
        [
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
          "PoolCreated",
          "PoolMarketInitialized",
        ],
        [2, 2, 3, 1, 1, 3],
      );

      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["RoleRevoked"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Fast-track timelock is not allowed to add new markets to the Core pool", async () => {
      const role = ethers.utils.solidityPack(["address", "string"], [bscmainnet.UNITROLLER, "_supportMarket(address)"]);
      const roleHash = ethers.utils.keccak256(role);
      const acm = new ethers.Contract(bscmainnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(roleHash, bscmainnet.FAST_TRACK_TIMELOCK)).to.be.false;
    });

    describe("emode", () => {
      it("should update lastPoolId to the new pool", async () => {
        expect(await comptroller.lastPoolId()).to.equals(EMODE_POOL.id);
      });

      it("should set the newly created pool as active with correct label", async () => {
        const newPool = await comptroller.pools(EMODE_POOL.id);
        expect(newPool.label).to.equals(EMODE_POOL.label);
        expect(newPool.isActive).to.equals(true);
        expect(newPool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);
      });

      it("should set the correct risk parameters to all pool markets", async () => {
        for (const config of Object.values(EMODE_POOL.marketConfig)) {
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
});
