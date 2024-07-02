import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { LAST_REWARD_BLOCK, REWARDS_DISTRIBUTOR_XVS, vip038, vsfrxETH } from "../../../proposals/sepolia/vip-038";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";

forking(6175294, () => {
  let rewardDistributor: Contract;

  before(async () => {
    rewardDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR_XVS);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip038());
    });

    it("check vsfrxETH last reward block", async () => {
      const supplyState = await rewardDistributor.rewardTokenSupplyState(vsfrxETH);
      expect(supplyState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);

      const borrowState = await rewardDistributor.rewardTokenBorrowState(vsfrxETH);
      expect(borrowState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);
    });
  });
});
