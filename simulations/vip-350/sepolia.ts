import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip052 from "../../multisig/proposals/sepolia/vip-052";
import { REWARD_DISTRIBUTORS } from "../../multisig/proposals/sepolia/vip-052";
import vip350 from "../../vips/vip-350/bsctestnet";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import { expectEvents } from "src/utils";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6460097, async () => {
  const provider = ethers.provider;
  before(async () => {
    await pretendExecutingVip(await vip052());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    for (const rewardDistributor of REWARD_DISTRIBUTORS) {
      it(`correct owner for ${rewardDistributor}`, async () => {
        const c = new ethers.Contract(rewardDistributor, REWARD_DISTRIBUTOR_ABI, provider);
        expect(await c.owner()).to.equal(sepolia.NORMAL_TIMELOCK);
      });
    }
  });
});
