import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip529, { DISTRIBUTION_SPEED_UNICHAIN } from "../../vips/vip-529/bscmainnet";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

forking(20788301, async () => {
  testForkedNetworkVipCommands("VIP 529", await vip529(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check xvs vault speed", async () => {
      const xvsVault = new ethers.Contract(unichainmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(unichainmainnet.XVS)).to.equals(
        DISTRIBUTION_SPEED_UNICHAIN,
      );
    });
  });
});
