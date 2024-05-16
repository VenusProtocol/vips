import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import { LAST_REWARD_BLOCK, REWARDS_DISTRIBUTOR_XVS, vFRAX, vip027, vsFRAX } from "../../../proposals/sepolia/vip-027";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardsDistributor.json";

forking(5913910, () => {
  let rewardDistributor: Contract;

  before(async () => {
    rewardDistributor = await ethers.getContractAt(REWARD_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR_XVS);
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip027());
    });

    it("check vFrax last reward block", async () => {
      const supplyState = await rewardDistributor.rewardTokenSupplyState(vFRAX);
      expect(supplyState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);

      const borrowState = await rewardDistributor.rewardTokenBorrowState(vFRAX);
      expect(borrowState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);
    });

    it("check vsFrax last reward block", async () => {
      const supplyState = await rewardDistributor.rewardTokenSupplyState(vsFRAX);
      expect(supplyState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);

      const borrowState = await rewardDistributor.rewardTokenBorrowState(vsFRAX);
      expect(borrowState.lastRewardingBlock).to.equal(LAST_REWARD_BLOCK);
    });
  });
});
