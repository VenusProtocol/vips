import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip052, { REWARD_DISTRIBUTORS } from "../../../proposals/sepolia/vip-052";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistrbutor.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6466682, async () => {
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
      await pretendExecutingVip(await vip052());
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`should have no pending owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.pendingOwner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }
  });
});
