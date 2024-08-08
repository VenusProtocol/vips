import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip054, {
  REWARDS_DISTRIBUTOR_CORE_NEW,
  REWARDS_DISTRIBUTOR_CORE_OLD,
  REWARDS_DISTRIBUTOR_LST_NEW,
  REWARDS_DISTRIBUTOR_LST_OLD,
  TOTAL_XVS_FOR_CORE_NEW,
  TOTAL_XVS_FOR_LST_NEW,
  XVS,
  XVS_AMOUNT_CORE_OLD,
  XVS_AMOUNT_LST_OLD,
} from "../../../proposals/ethereum/vip-054";
import REWARDS_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";
import XVS_ABI from "./abi/xvs.json";

forking(20484269, async () => {
  let xvs: Contract;
  const provider = ethers.provider;
  xvs = new ethers.Contract(XVS, XVS_ABI, provider);
  const TOTAL_XVS_CORE = parseUnits("5731818055555557437136", 0);
  const TOTAL_XVS_LST = parseUnits("1473648148148148324155", 0);

  describe("Pre-VIP behaviour", () => {
    it("should have old XVS token in original reward distributor ", async () => {
      const rewardsDistributorCoreOld = await ethers.getContractAt(
        REWARDS_DISTRIBUTOR_ABI,
        REWARDS_DISTRIBUTOR_CORE_OLD,
      );

      const rewardDistributorLSTOld = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR_LST_OLD);
      expect(await xvs.balanceOf(rewardsDistributorCoreOld.address)).to.be.equal(XVS_AMOUNT_CORE_OLD);
      expect(await xvs.balanceOf(rewardDistributorLSTOld.address)).to.be.equal(XVS_AMOUNT_LST_OLD);
    });
  });
  describe("Post-VIP behavior", async () => {
    let newCoreDistributorBalance: BigNumber,
      newLstDistributorBalance: BigNumber,
      oldCoreDistributorBalance: BigNumber,
      oldLstDistributorBalance: BigNumber;
    before(async () => {
      xvs = await ethers.getContractAt(XVS_ABI, XVS);
      oldCoreDistributorBalance = await xvs.balanceOf(REWARDS_DISTRIBUTOR_CORE_OLD);
      oldLstDistributorBalance = await xvs.balanceOf(REWARDS_DISTRIBUTOR_LST_OLD);
      newCoreDistributorBalance = await xvs.balanceOf(REWARDS_DISTRIBUTOR_CORE_NEW);
      newLstDistributorBalance = await xvs.balanceOf(REWARDS_DISTRIBUTOR_LST_NEW);
      await pretendExecutingVip(await vip054());
    });
    it("should transfer correct values", async () => {
      expect(TOTAL_XVS_FOR_CORE_NEW).to.be.equal(TOTAL_XVS_CORE);
      expect(TOTAL_XVS_FOR_LST_NEW).to.be.equal(TOTAL_XVS_LST);
    });

    it("should have correct balance left in old rewarder and new rewarder", async () => {
      expect(await xvs.balanceOf(REWARDS_DISTRIBUTOR_CORE_OLD)).to.be.equal(
        oldCoreDistributorBalance.sub(TOTAL_XVS_FOR_CORE_NEW),
      );
      expect(await xvs.balanceOf(REWARDS_DISTRIBUTOR_LST_OLD)).to.be.equal(
        oldLstDistributorBalance.sub(TOTAL_XVS_FOR_LST_NEW),
      );
      expect(await xvs.balanceOf(REWARDS_DISTRIBUTOR_CORE_NEW)).to.be.equal(
        TOTAL_XVS_FOR_CORE_NEW.add(newCoreDistributorBalance),
      );
      expect(await xvs.balanceOf(REWARDS_DISTRIBUTOR_LST_NEW)).to.be.equal(
        TOTAL_XVS_FOR_LST_NEW.add(newLstDistributorBalance),
      );
    });
  });
});
