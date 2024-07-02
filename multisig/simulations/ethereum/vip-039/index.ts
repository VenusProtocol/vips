import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { LAST_REWARD_BLOCK, REWARDS_DISTRIBUTOR_XVS, vip039, vsfrxETH } from "../../../proposals/ethereum/vip-039";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";

forking(20189393, () => {
  let rewardDistributor: Contract;

  before(async () => {
    rewardDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR_XVS);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip039());
    });

    it("check vsfrxETH last reward block", async () => {
      const supplyState = await rewardDistributor.rewardTokenSupplyState(vsfrxETH);
      expect(supplyState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);

      const borrowState = await rewardDistributor.rewardTokenBorrowState(vsfrxETH);
      expect(borrowState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);
    });
  });
});
