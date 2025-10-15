import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip552, { ZKSYNC_SPEED, ZKSYNC_XVS_BRIDGE_AMOUNT, ZKSYNC_XVS_STORE } from "../../vips/vip-552/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;
export const XVS_BRIDGE_ZKSYNC = "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116";

forking(65079703, async () => {
  const xvs = new ethers.Contract(zksyncmainnet.XVS, XVS_ABI, ethers.provider);
  const xvsVault = new ethers.Contract(zksyncmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
  let previousBalanceXVSStore: BigNumber;

  before(async () => {
    previousBalanceXVSStore = await xvs.balanceOf(ZKSYNC_XVS_STORE);

    const signer = await initMainnetUser("0x16a62b534e09a7534cd5847cfe5bf6a4b0c1b116", parseUnits("10", 18));
    await xvs.connect(signer).mint(ZKSYNC_XVS_STORE, ZKSYNC_XVS_BRIDGE_AMOUNT);
  });

  testForkedNetworkVipCommands("VIP 552", await vip552());

  describe("Post-VIP behaviour", async () => {
    it("check xvs balance", async () => {
      const currentBalance = await xvs.balanceOf(ZKSYNC_XVS_STORE);
      expect(currentBalance).to.equals(previousBalanceXVSStore.add(ZKSYNC_XVS_BRIDGE_AMOUNT));
    });

    it("should update the XVS distribution speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(zksyncmainnet.XVS);
      expect(speed).to.equal(ZKSYNC_SPEED);
    });
  });
});
