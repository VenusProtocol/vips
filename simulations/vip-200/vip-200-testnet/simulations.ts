import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, testVip } from "../../../src/vip-framework";
import { vip200Testnet } from "../../../vips/vip-200/vip-200-testnet";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const REWARDS_START_BLOCK = 34772656;
const REWARDS_END_BLOCK_28_DAYS = REWARDS_START_BLOCK + 806400;
const VPLANET_DEFI = "0xe237aA131E7B004aC88CB808Fa56AF3dc4C408f1";
const REWARD_DISTRIBUTOR = "0x9372F0d88988B2cC0a2bf8700a5B3f04B0b81b8C";

forking(34969612, async () => {
  testVip("VIP-200", await vip200Testnet());

  describe("Rewards distributors configuration", () => {
    describe("Last Reward Blcok", () => {
      let rewardsDistributor: Contract;
      before(async () => {
        rewardsDistributor = await ethers.getContractAt(REWARDS_DISTRIBUTOR_ABI, REWARD_DISTRIBUTOR);
      });

      it(`should have lastRewardingBlock for supply side equal to "35579056"`, async () => {
        const supplyState = await rewardsDistributor.rewardTokenSupplyState(VPLANET_DEFI);
        expect(supplyState.lastRewardingBlock).to.equal(REWARDS_END_BLOCK_28_DAYS);
      });

      it(`should have lastRewardingBlock for borrow side equal to "35579056"`, async () => {
        const borrowState = await rewardsDistributor.rewardTokenBorrowState(VPLANET_DEFI);
        expect(borrowState.lastRewardingBlock).to.equal(REWARDS_END_BLOCK_28_DAYS);
      });
    });
  });
});
