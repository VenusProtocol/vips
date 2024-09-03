import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip013 from "../../multisig/proposals/arbitrumsepolia/vip-013";
import { REWARD_DISTRIBUTORS } from "../../multisig/proposals/arbitrumsepolia/vip-013";
import vip350 from "../../vips/vip-350/bsctestnet";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import { expectEvents } from "src/utils";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

forking(70004884, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip013());
  });

  testForkedNetworkVipCommands("vip350", await vip350(),{
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.owner()).to.equal(arbitrumsepolia.NORMAL_TIMELOCK);
      });
    }
  });
});
