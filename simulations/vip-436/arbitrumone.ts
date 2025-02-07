import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip020 from "../../multisig/proposals/arbitrumone/vip-020";
import { REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumone/vip-020";
import vip436 from "../../vips/vip-436/bscmainnet";
import OWNERSHIP_ABI from "../vip-433/abi/Ownership.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(300525165, async () => {
  const provider = ethers.provider;

  before(async () => {
    await pretendExecutingVip(await vip020());
  });

  testForkedNetworkVipCommands("Accept ownerships/admins", await vip436());

  describe("Post-VIP behavior", async () => {
    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, OWNERSHIP_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }
  });
});
