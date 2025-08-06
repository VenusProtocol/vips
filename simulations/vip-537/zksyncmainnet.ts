import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip537, { BRIDGE_FEES_ZKSYNC, REWARD_DISTRIBUTORS_ZKSYNC } from "../../vips/vip-537/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardDistributor.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

forking(63766213, async () => {
  const xvs = new ethers.Contract(zksyncmainnet.XVS, XVS_ABI, ethers.provider);
  const previousBalanceRewardDistirbutors: any = {};

  before(async () => {
    await setBalance(zksyncmainnet.NORMAL_TIMELOCK, BRIDGE_FEES_ZKSYNC);

    for (const distributor of REWARD_DISTRIBUTORS_ZKSYNC) {
      previousBalanceRewardDistirbutors[distributor.address] = await xvs.balanceOf(distributor.address);
    }
  });

  testForkedNetworkVipCommands("VIP 537", await vip537(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [REWARD_DISTRIBUTOR_ABI], ["RewardTokenGranted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check xvs balance", async () => {
      for (const distributor of REWARD_DISTRIBUTORS_ZKSYNC) {
        const currentBalanceDistributor = await xvs.balanceOf(distributor.address);
        expect(currentBalanceDistributor).to.equals(
          previousBalanceRewardDistirbutors[distributor.address].sub(distributor.excess),
        );
      }
    });
  });
});
