import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import vip053, { REWARD_DISTRIBUTORS } from "../../../proposals/ethereum/vip-053";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistrbutor.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(20482219, async () => {
  const provider = ethers.provider;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`should have no pending owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethers.constants.AddressZero);
      });
    }
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip053());
    });

    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`should have no pending owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.pendingOwner()).to.equal(ethereum.NORMAL_TIMELOCK);
      });
    }
  });
});