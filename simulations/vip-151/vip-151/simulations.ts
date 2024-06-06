import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip151 } from "../../../vips/vip-151/vip-151";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const REWARD_DISTRIBUTOR = "0x14d9A428D0f35f81A30ca8D8b2F3974D3CccB98B";
const vankrBNB_DeFi = "0x53728FD51060a85ac41974C6C3Eb1DaE42776723";

const REWARDS_START_BLOCK = 30336476;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 864000;
forking(30441939, async () => {
  testVip("VIP-151", await vip151());

  describe("Rewards distributors configuration", () => {
    describe("Last Reward Blcok", () => {
      let rewardsDistributor: Contract;
      before(async () => {
        rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, REWARD_DISTRIBUTOR);
      });

      it(`should have lastRewardingBlock for supply side equal to "32705401"`, async () => {
        const supplyState = await rewardsDistributor.rewardTokenSupplyState(vankrBNB_DeFi);
        expect(supplyState.lastRewardingBlock).to.equal(REWARDS_END_BLOCK_30_DAYS);
      });

      it(`should have lastRewardingBlock for borrow side equal to "32705401"`, async () => {
        const borrowState = await rewardsDistributor.rewardTokenBorrowState(vankrBNB_DeFi);
        expect(borrowState.lastRewardingBlock).to.equal(REWARDS_END_BLOCK_30_DAYS);
      });
    });
  });
});
