import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip169 } from "../../../vips/vip-169/vip-169";
import REWARDS_DISTRIBUTOR_ABI from "./abi/REWARDS_DISTRIBUTOR.json";

const HAY_REWARDS_DISTRIBUTOR = "0xA31185D804BF9209347698128984a43A67Ce6d11";
const SD_REWARDS_DISTRIBUTOR = "0xBE607b239a8776B47159e2b0E9E65a7F1DAA6478";
const MARKET_BNBx = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const MARKET_HAY = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";

forking(31715160, async () => {
  let hayRewardsDistributor: Contract;
  let sdRewardsDistributor: Contract;
  const provider = ethers.provider;

  before(async () => {
    hayRewardsDistributor = new ethers.Contract(HAY_REWARDS_DISTRIBUTOR, REWARDS_DISTRIBUTOR_ABI, provider);
    sdRewardsDistributor = new ethers.Contract(SD_REWARDS_DISTRIBUTOR, REWARDS_DISTRIBUTOR_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    describe("Rewards Distributor", async () => {
      it("Validate last rewarding block", async () => {
        expect((await hayRewardsDistributor.rewardTokenSupplyState(MARKET_HAY)).lastRewardingBlock).to.equal(0);
        expect((await sdRewardsDistributor.rewardTokenSupplyState(MARKET_BNBx)).lastRewardingBlock).to.equal(0);
        expect((await hayRewardsDistributor.rewardTokenBorrowState(MARKET_HAY)).lastRewardingBlock).to.equal(0);
        expect((await sdRewardsDistributor.rewardTokenBorrowState(MARKET_BNBx)).lastRewardingBlock).to.equal(0);
      });
    });
  });

  testVip("VIP-169 Stop HAY and SD Rewards", await vip169(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [REWARDS_DISTRIBUTOR_ABI],
        ["SupplyLastRewardingBlockUpdated", "BorrowLastRewardingBlockUpdated"],
        [2, 2],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("Rewards Distributor", async () => {
      it("Validate last rewarding block", async () => {
        expect((await hayRewardsDistributor.rewardTokenSupplyState(MARKET_HAY)).lastRewardingBlock).to.equal(32200789);
        expect((await sdRewardsDistributor.rewardTokenSupplyState(MARKET_BNBx)).lastRewardingBlock).to.equal(32258389);
        expect((await hayRewardsDistributor.rewardTokenBorrowState(MARKET_HAY)).lastRewardingBlock).to.equal(32200789);
        expect((await sdRewardsDistributor.rewardTokenBorrowState(MARKET_BNBx)).lastRewardingBlock).to.equal(32258389);
      });
    });
  });
});
