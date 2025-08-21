import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip539, { BRIDGE_FEES_ETH, REWARD_DISTRIBUTORS_ETH } from "../../vips/vip-539/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/rewardDistributor.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(23081409, async () => {
  const xvs = new ethers.Contract(ethereum.XVS, XVS_ABI, ethers.provider);
  const previousBalanceRewardDistirbutors: any = {};

  before(async () => {
    await setBalance(ethereum.NORMAL_TIMELOCK, BRIDGE_FEES_ETH);

    for (const distributor of REWARD_DISTRIBUTORS_ETH) {
      previousBalanceRewardDistirbutors[distributor.address] = await xvs.balanceOf(distributor.address);
    }
  });

  testForkedNetworkVipCommands("VIP 539", await vip539(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [REWARD_DISTRIBUTOR_ABI], ["RewardTokenGranted"], [6]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check xvs balance", async () => {
      for (const distributor of REWARD_DISTRIBUTORS_ETH) {
        const currentBalanceDistributor = await xvs.balanceOf(distributor.address);
        expect(currentBalanceDistributor).to.equals(
          previousBalanceRewardDistirbutors[distributor.address].sub(distributor.excess),
        );
      }
    });
  });
});
