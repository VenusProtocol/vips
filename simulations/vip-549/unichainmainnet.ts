import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip549, { UNICHAIN_SPEED, UNICHAIN_XVS_BRIDGE_AMOUNT, UNICHAIN_XVS_STORE } from "../../vips/vip-549/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { unichainmainnet } = NETWORK_ADDRESSES;
export const XVS_BRIDGE_UNICHAIN = "0x9c95f8aa28fFEB7ECdC0c407B9F632419c5daAF8";

forking(28572871, async () => {
  const xvs = new ethers.Contract(unichainmainnet.XVS, XVS_ABI, ethers.provider);
  const xvsVault = new ethers.Contract(unichainmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
  let previousBalanceXVSStore: BigNumber;

  before(async () => {
    previousBalanceXVSStore = await xvs.balanceOf(UNICHAIN_XVS_STORE);

    await impersonateAccount(XVS_BRIDGE_UNICHAIN);
    await setBalance(XVS_BRIDGE_UNICHAIN, parseUnits("10", 18));
    await xvs.connect(await ethers.getSigner(XVS_BRIDGE_UNICHAIN)).mint(UNICHAIN_XVS_STORE, UNICHAIN_XVS_BRIDGE_AMOUNT);
  });

  testForkedNetworkVipCommands("VIP 549", await vip549());

  describe("Post-VIP behaviour", async () => {
    it("check xvs balance", async () => {
      const currentBalance = await xvs.balanceOf(UNICHAIN_XVS_STORE);
      expect(currentBalance).to.equals(previousBalanceXVSStore.add(UNICHAIN_XVS_BRIDGE_AMOUNT));
    });

    it("should update the XVS distribution speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(unichainmainnet.XVS);
      expect(speed).to.equal(UNICHAIN_SPEED);
    });
  });
});
