import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { forking, pretendExecutingVip } from "src/vip-framework";

import { LAST_REWARD_BLOCK, REWARDS_DISTRIBUTOR, vip023, vweETH } from "../../../proposals/sepolia/vip-023";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";

forking(5760823, async () => {
  let rewardDistributor: Contract;

  before(async () => {
    rewardDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip023());
    });

    it("check last reward block", async () => {
      const supplyState = await rewardDistributor.rewardTokenSupplyState(vweETH);
      expect(supplyState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);

      const borrowState = await rewardDistributor.rewardTokenBorrowState(vweETH);
      expect(borrowState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);
    });
  });
});
