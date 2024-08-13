import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip013, { REWARD_DISTRIBUTORS } from "../../../proposals/arbitrumsepolia/vip-013";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistrbutor.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(69942668, async () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`should have no pending owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip013());
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`should have no pending owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.pendingOwner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }
  });
});
