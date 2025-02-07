import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ZKSYNCMAINNET_XVS_SPEED, vip422 } from "../../vips/vip-422/bscmainnet";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

forking(53343717, async () => {
  const xvsVault = new ethers.Contract(zksyncmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);

  testForkedNetworkVipCommands("XVS", await vip422());

  describe("Post-Execution state", () => {
    it("check speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(zksyncmainnet.XVS);
      expect(speed).to.equal(ZKSYNCMAINNET_XVS_SPEED);
    });
  });
});
