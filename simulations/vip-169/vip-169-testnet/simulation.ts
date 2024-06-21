import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip169Testnet } from "../../../vips/vip-169/vip-169-testnet";
import REWARDS_DISTRIBUTOR_ABI from "./abi/REWARDS_DISTRIBUTOR.json";

const HAY_REWARDS_DISTRIBUTOR = "0x2aBEf3602B688493fe698EF11D27DCa43a0CE4BE";
const SD_REWARDS_DISTRIBUTOR = "0x37fA1e5613455223F09e179DFAEBba61d7505C97";
const MARKET_BNBx = "0x644A149853E5507AdF3e682218b8AC86cdD62951";
const MARKET_HAY = "0x170d3b2da05cc2124334240fB34ad1359e34C562";

forking(33312614, async () => {
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

  testVip("VIP-169 Stop HAY and SD Rewards", await vip169Testnet(), {
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
        expect((await hayRewardsDistributor.rewardTokenSupplyState(MARKET_HAY)).lastRewardingBlock).to.equal(33677478);
        expect((await sdRewardsDistributor.rewardTokenSupplyState(MARKET_BNBx)).lastRewardingBlock).to.equal(33735078);
        expect((await hayRewardsDistributor.rewardTokenBorrowState(MARKET_HAY)).lastRewardingBlock).to.equal(33677478);
        expect((await sdRewardsDistributor.rewardTokenBorrowState(MARKET_BNBx)).lastRewardingBlock).to.equal(33735078);
      });
    });
  });
});
