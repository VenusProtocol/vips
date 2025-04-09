import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ZKSYNC_DISTRIBUTION_SPEED, vip477 } from "../../vips/vip-477/bscmainnet";
import XVS_VAULT_ABI from "./abi/XVVaultProxy.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

forking(58794907, async () => {
  testForkedNetworkVipCommands("VIP-477", await vip477(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check distribution speed", async () => {
      const vault = new ethers.Contract(zksyncmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      const distributionSpeed = await vault.rewardTokenAmountsPerBlockOrSecond(zksyncmainnet.XVS);
      expect(distributionSpeed).to.equal(ZKSYNC_DISTRIBUTION_SPEED);
    });
  });
});
