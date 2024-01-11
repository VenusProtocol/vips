import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { checkRewardsDistributorPool } from "../../../../src/vip-framework/checks/rewardsDistributor";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { COMPTROLLER_CORE, XVS, vip007 } from "../../../proposals/vip-007/vip-007-sepolia";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardDistributor.json";

forking(5064614, () => {
  let comptroller: Contract;
  describe("Generic checks", async () => {
    before(async () => {
      await pretendExecutingVip(vip007());
      comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER_CORE);
    });
    checkRewardsDistributorPool(COMPTROLLER_CORE, 4);
    it("Validate reward distributors", async () => {
      const rewardDistributors = await comptroller.getRewardDistributors();
      for (let i = 0; i < rewardDistributors.length; i++) {
        const inst = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, rewardDistributors[i]);
        expect(await inst.rewardToken()).equals(XVS);
      }
    });
  });
});
