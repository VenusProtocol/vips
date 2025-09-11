import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip541, { REWARD_DISTRIBUTORS_ARB } from "../../vips/vip-541/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardDistributor.json";

const { arbitrumone } = NETWORK_ADDRESSES;

forking(377430519, async () => {
  const xvs = new ethers.Contract(arbitrumone.XVS, XVS_ABI, ethers.provider);
  const previousBalanceRewardDistirbutors: any = {};

  before(async () => {
    for (const distributor of REWARD_DISTRIBUTORS_ARB) {
      previousBalanceRewardDistirbutors[distributor.address] = await xvs.balanceOf(distributor.address);
    }
  });

  testForkedNetworkVipCommands("VIP 541", await vip541(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [REWARD_DISTRIBUTOR_ABI], ["RewardTokenGranted"], [2]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check xvs balance", async () => {
      for (const distributor of REWARD_DISTRIBUTORS_ARB) {
        const currentBalanceDistributor = await xvs.balanceOf(distributor.address);
        expect(currentBalanceDistributor).to.equals(
          previousBalanceRewardDistirbutors[distributor.address].sub(distributor.excess),
        );
      }
    });
  });
});
