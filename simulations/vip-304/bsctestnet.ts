import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../src/vip-framework";
import { REWARDS_DISTRIBUTOR, REWARDS_END_BLOCK_90_DAYS, VBABYDOGE, vip304 } from "../../vips/vip-304/bsctestnet";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

forking(40378717, () => {
  testVip("VIP-304", vip304());

  describe("Rewards distributors configuration", () => {
    describe("Last Reward Blcok", () => {
      let rewardsDistributor: Contract;
      before(async () => {
        rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, REWARDS_DISTRIBUTOR);
      });

      it(`should have lastRewardingBlock for supply side equal to after 90 days`, async () => {
        const supplyState = await rewardsDistributor.rewardTokenSupplyState(VBABYDOGE);
        expect(supplyState.lastRewardingBlock).to.equal(REWARDS_END_BLOCK_90_DAYS);
      });

      it(`should have lastRewardingBlock for borrow side equal to after 90 days`, async () => {
        const borrowState = await rewardsDistributor.rewardTokenBorrowState(VBABYDOGE);
        expect(borrowState.lastRewardingBlock).to.equal(REWARDS_END_BLOCK_90_DAYS);
      });
    });
  });
});
