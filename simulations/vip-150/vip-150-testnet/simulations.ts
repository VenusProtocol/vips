import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip150Testnet } from "../../../vips/vip-150/vip-150-testnet";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const REWARDS_START_BLOCK = 31839459;
const REWARDS_END_BLOCK_30_DAYS = REWARDS_START_BLOCK + 864000;
const REWARD_DISTRIBUTOR = "0x4be90041D1e082EfE3613099aA3b987D9045d718";
const vankrBNB_DeFi = "0xe507B30C41E9e375BCe05197c1e09fc9ee40c0f6";

forking(32034863, () => {
  testVip("VIP-150", vip150Testnet());

  describe("Rewards distributors configuration", () => {
    describe("Last Reward Blcok", () => {
      let rewardsDistributor: Contract;
      before(async () => {
        rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, REWARD_DISTRIBUTOR);
      });

      it(`should have lastRewardingBlock for supply side equal to "31113069"`, async () => {
        const supplyState = await rewardsDistributor.rewardTokenSupplyState(vankrBNB_DeFi);
        expect(supplyState.lastRewardingBlock).to.equal(REWARDS_END_BLOCK_30_DAYS);
      });

      it(`should have lastRewardingBlock for borrow side equal to "31113069"`, async () => {
        const borrowState = await rewardsDistributor.rewardTokenBorrowState(vankrBNB_DeFi);
        expect(borrowState.lastRewardingBlock).to.equal(REWARDS_END_BLOCK_30_DAYS);
      });
    });
  });
});
