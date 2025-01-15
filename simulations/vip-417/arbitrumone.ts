import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip014 from "../../multisig/proposals/arbitrumone/vip-019";
import { REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumone/vip-019";
import vip417 from "../../vips/vip-417/bscmainnet";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(291641176, async () => {
  const provider = ethers.provider;

  before(async () => {
    await pretendExecutingVip(await vip014());
  });

  testForkedNetworkVipCommands("vip350", await vip417());

  describe("Post-VIP behavior", async () => {
    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }
  });
});
