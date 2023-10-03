import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import {
  BLOCKS_7_DAYS,
  BLOCKS_56_DAYS,
  RewardsDistributor_ANGLE_Stablecoin,
  RewardsDistributor_HAY_LiquidStakedBNB,
  vip179Testnet,
} from "../../../vips/vip-179/vip-179-testnet";
import REWARDS_DISTRIBUTOR_ABI from "./abi/rewardsDistributor.json";

forking(33878000, () => {
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

  testVip("VIP-179Testnet", vip179Testnet(), {
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
      expect(supplyState.lastRewardingBlock).to.equal(
        RewardsDistributor_HAY_LiquidStakedBNB.rewardStartBlock + BLOCKS_56_DAYS,
      );
    });

    it("Verify Last Rewarding block for borrow side for snBNB market", async () => {
      const borrowState = await rewardsDistributor_HAY_LiquidStakedBNB.rewardTokenBorrowState(
        RewardsDistributor_HAY_LiquidStakedBNB.vToken,
      );
      expect(borrowState.lastRewardingBlock).to.equal(
        RewardsDistributor_HAY_LiquidStakedBNB.rewardStartBlock + BLOCKS_56_DAYS,
      );
    });

    it("Verify Last Rewarding block for supply side for agEUR market", async () => {
      const supplyState = await rewardsDistributor_ANGLE_Stablecoin.rewardTokenSupplyState(
        RewardsDistributor_ANGLE_Stablecoin.vToken,
      );
      expect(supplyState.lastRewardingBlock).to.equal(
        RewardsDistributor_ANGLE_Stablecoin.rewardStartBlock + BLOCKS_7_DAYS,
      );
    });

    it("Verify Last Rewarding block for borrow side for agEUR market", async () => {
      const borrowState = await rewardsDistributor_ANGLE_Stablecoin.rewardTokenBorrowState(
        RewardsDistributor_ANGLE_Stablecoin.vToken,
      );
      expect(borrowState.lastRewardingBlock).to.equal(
        RewardsDistributor_ANGLE_Stablecoin.rewardStartBlock + BLOCKS_7_DAYS,
      );
    });
  });
});
