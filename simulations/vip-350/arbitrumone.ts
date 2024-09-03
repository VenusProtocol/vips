import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip010 from "../../multisig/proposals/arbitrumone/vip-010";
import { REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumone/vip-010";
import vip350 from "../../vips/vip-350/bscmainnet";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import { expectEvents } from "src/utils";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(241112064, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip010());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumone.NORMAL_TIMELOCK);
      });
    }
  });
});
