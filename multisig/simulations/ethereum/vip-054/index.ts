import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip054, {
  REWARDS_DISTRIBUTOR_CORE_NEW,
  REWARDS_DISTRIBUTOR_CORE_OLD,
  REWARDS_DISTRIBUTOR_CURVE_NEW,
  REWARDS_DISTRIBUTOR_CURVE_OLD,
  REWARDS_DISTRIBUTOR_LST_NEW,
  REWARDS_DISTRIBUTOR_LST_OLD,
  XVS,
  XVS_AMOUNT_CORE,
  XVS_AMOUNT_CURVE,
  XVS_AMOUNT_LST,
} from "../../../proposals/ethereum/vip-054";
import REWARDS_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";
import XVS_ABI from "./abi/xvs.json";

forking(20433285, async () => {
  let xvs: Contract;
  const provider = ethers.provider;
  describe("Pre-VIP behaviour", () => {
    it("should have old XVS token in original reward distributor ", async () => {
      xvs = new ethers.Contract(XVS, XVS_ABI, provider);

      const rewardsDistributorCoreOld = await ethers.getContractAt(
        REWARDS_DISTRIBUTOR_ABI,
        REWARDS_DISTRIBUTOR_CORE_OLD,
      );
      const rewardsDistributorCurveOld = await ethers.getContractAt(
        REWARDS_DISTRIBUTOR_ABI,
        REWARDS_DISTRIBUTOR_CURVE_OLD,
      );
      const rewardDistributorLSTOld = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR_LST_OLD);

      expect(await xvs.balanceOf(rewardsDistributorCoreOld.address)).to.be.equal(XVS_AMOUNT_CORE);
      expect(await xvs.balanceOf(rewardsDistributorCurveOld.address)).to.be.equal(XVS_AMOUNT_CURVE);
      expect(await xvs.balanceOf(rewardDistributorLSTOld.address)).to.be.equal(XVS_AMOUNT_LST);
    });
  });

  describe("Post-VIP behavior", async () => {
    let xvs: Contract;
    let prevCoreDistributorBalance: BigNumber;
    let prevCurveDistributorBalance: BigNumber;
    let prevLstDistributorBalance: BigNumber;
    before(async () => {
      xvs = await ethers.getContractAt(XVS_ABI, XVS);

      prevCoreDistributorBalance = await xvs.balanceOf(REWARDS_DISTRIBUTOR_CORE_NEW);
      prevCurveDistributorBalance = await xvs.balanceOf(REWARDS_DISTRIBUTOR_CURVE_NEW);
      prevLstDistributorBalance = await xvs.balanceOf(REWARDS_DISTRIBUTOR_LST_NEW);
      await pretendExecutingVip(await vip054());
    });

    it("should have correct balance", async () => {
      const coreDistributorBalance = await xvs.balanceOf(REWARDS_DISTRIBUTOR_CORE_NEW);
      const curveDistributorBalance = await xvs.balanceOf(REWARDS_DISTRIBUTOR_CURVE_NEW);
      const lstDistributorBalance = await xvs.balanceOf(REWARDS_DISTRIBUTOR_LST_NEW);

      expect(coreDistributorBalance.sub(prevCoreDistributorBalance)).to.equal(XVS_AMOUNT_CORE);
      expect(curveDistributorBalance.sub(prevCurveDistributorBalance)).to.equal(XVS_AMOUNT_CURVE);
      expect(lstDistributorBalance.sub(prevLstDistributorBalance)).to.equal(XVS_AMOUNT_LST);
    });
  });
});
