import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import {
  RewardsDistributor_ANGLE_Stablecoin,
  RewardsDistributor_HAY_LiquidStakedBNB,
  vip182,
} from "../../../vips/vip-182/vip-182";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

const BLOCKS_56_DAYS = (60 * 60 * 24 * 56) / 3;
const BLOCKS_7_DAYS = (60 * 60 * 24 * 7) / 3;

const snBNB_FirstRewardingBlock = 32228156;
const agEUR_FirsRewardingBlock = 32338350;

const snBNB_LastRewardingBlock = snBNB_FirstRewardingBlock + BLOCKS_56_DAYS;
const agEUR_LastRewardingBlock = agEUR_FirsRewardingBlock + BLOCKS_7_DAYS;

forking(32338400, async () => {
  let rewardsDistributor_HAY_LiquidStakedBNB: Contract;
  let rewardsDistributor_ANGLE_Stablecoin: Contract;

  before(async () => {
    rewardsDistributor_HAY_LiquidStakedBNB = await ethers.getContractAt(
      REWARDS_DISTRIBUTOR_ABI,
      RewardsDistributor_HAY_LiquidStakedBNB.address,
    );
    rewardsDistributor_ANGLE_Stablecoin = await ethers.getContractAt(
      REWARDS_DISTRIBUTOR_ABI,
      RewardsDistributor_ANGLE_Stablecoin.address,
    );
  });

  describe("Pre-VIP behavior", () => {
    it("Verify Last Rewarding block for supply side for snBNB market", async () => {
      const supplyState = await rewardsDistributor_HAY_LiquidStakedBNB.rewardTokenSupplyState(
        RewardsDistributor_HAY_LiquidStakedBNB.vToken,
      );
      expect(supplyState.lastRewardingBlock).to.equal(0);
    });

    it("Verify Last Rewarding block for borrow side for snBNB market", async () => {
      const borrowState = await rewardsDistributor_HAY_LiquidStakedBNB.rewardTokenBorrowState(
        RewardsDistributor_HAY_LiquidStakedBNB.vToken,
      );
      expect(borrowState.lastRewardingBlock).to.equal(0);
    });

    it("Verify Last Rewarding block for supply side for agEUR market", async () => {
      const supplyState = await rewardsDistributor_ANGLE_Stablecoin.rewardTokenSupplyState(
        RewardsDistributor_ANGLE_Stablecoin.vToken,
      );
      expect(supplyState.lastRewardingBlock).to.equal(0);
    });

    it("Verify Last Rewarding block for borrow side for agEUR market", async () => {
      const borrowState = await rewardsDistributor_ANGLE_Stablecoin.rewardTokenBorrowState(
        RewardsDistributor_ANGLE_Stablecoin.vToken,
      );
      expect(borrowState.lastRewardingBlock).to.equal(0);
    });
  });

  testVip("VIP-182", await vip182(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [REWARDS_DISTRIBUTOR_ABI],
        ["SupplyLastRewardingBlockUpdated", "BorrowLastRewardingBlockUpdated"],
        [2, 2],
      );
    },
  });

  describe("Post-VIP Behaviour", () => {
    it("Verify Last Rewarding block for supply side for snBNB market", async () => {
      const supplyState = await rewardsDistributor_HAY_LiquidStakedBNB.rewardTokenSupplyState(
        RewardsDistributor_HAY_LiquidStakedBNB.vToken,
      );
      expect(supplyState.lastRewardingBlock).to.equal(snBNB_LastRewardingBlock);
    });

    it("Verify Last Rewarding block for borrow side for snBNB market", async () => {
      const borrowState = await rewardsDistributor_HAY_LiquidStakedBNB.rewardTokenBorrowState(
        RewardsDistributor_HAY_LiquidStakedBNB.vToken,
      );
      expect(borrowState.lastRewardingBlock).to.equal(snBNB_LastRewardingBlock);
    });

    it("Verify Last Rewarding block for supply side for agEUR market", async () => {
      const supplyState = await rewardsDistributor_ANGLE_Stablecoin.rewardTokenSupplyState(
        RewardsDistributor_ANGLE_Stablecoin.vToken,
      );
      expect(supplyState.lastRewardingBlock).to.equal(agEUR_LastRewardingBlock);
    });

    it("Verify Last Rewarding block for borrow side for agEUR market", async () => {
      const borrowState = await rewardsDistributor_ANGLE_Stablecoin.rewardTokenBorrowState(
        RewardsDistributor_ANGLE_Stablecoin.vToken,
      );
      expect(borrowState.lastRewardingBlock).to.equal(agEUR_LastRewardingBlock);
    });
  });
});
