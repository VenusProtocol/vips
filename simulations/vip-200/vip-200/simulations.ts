import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip200 } from "../../../vips/vip-200/vip-200";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const VPLANET_DEFI = "0xFf1112ba7f88a53D4D23ED4e14A117A2aE17C6be";
const REWARD_DISTRIBUTOR = "0xD86FCff6CCF5C4E277E49e1dC01Ed4bcAb8260ba";

const REWARDS_START_BLOCK = 33343823;
const REWARDS_END_BLOCK_28_DAYS = REWARDS_START_BLOCK + 806400;
forking(33365249, () => {
  testVip("VIP-200", vip200());

  describe("Rewards distributors configuration", () => {
    describe("Last Reward Blcok", () => {
      let rewardsDistributor: Contract;
      before(async () => {
        rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, REWARD_DISTRIBUTOR);
      });

      it(`should have lastRewardingBlock for supply side equal to "34150223"`, async () => {
        const supplyState = await rewardsDistributor.rewardTokenSupplyState(VPLANET_DEFI);
        expect(supplyState.lastRewardingBlock).to.equal(REWARDS_END_BLOCK_28_DAYS);
      });

      it(`should have lastRewardingBlock for borrow side equal to "34150223"`, async () => {
        const borrowState = await rewardsDistributor.rewardTokenBorrowState(VPLANET_DEFI);
        expect(borrowState.lastRewardingBlock).to.equal(REWARDS_END_BLOCK_28_DAYS);
      });
    });
  });
});
