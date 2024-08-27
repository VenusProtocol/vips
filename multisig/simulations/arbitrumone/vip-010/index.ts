import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip010, { REWARD_DISTRIBUTORS } from "../../../proposals/arbitrumone/vip-010";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistrbutor.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(241039405, async () => {
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
      await pretendExecutingVip(await vip010());
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`should have Normal Timelock as pending owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.pendingOwner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }
  });
});
