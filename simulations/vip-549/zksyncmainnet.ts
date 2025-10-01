import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip549, {
  ZKSYNC_SPEED,
  ZKSYNC_XVS_BRIDGE_AMOUNT,
  ZKSYNC_XVS_STORE
} from "../../vips/vip-549/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;
export const XVS_BRIDGE_ZKSYNC = "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116";

forking(64989498, async () => {
  const xvs = new ethers.Contract(zksyncmainnet.XVS, XVS_ABI, ethers.provider);
  const xvsVault = new ethers.Contract(zksyncmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
  let previousBalanceXVSStore: BigNumber;

  before(async () => {
    previousBalanceXVSStore = await xvs.balanceOf(ZKSYNC_XVS_STORE);

    await impersonateAccount(XVS_BRIDGE_ZKSYNC);
    await setBalance(XVS_BRIDGE_ZKSYNC, parseUnits("10", 18));
    await xvs
      .connect(await ethers.getSigner(XVS_BRIDGE_ZKSYNC))
      .mint(ZKSYNC_XVS_STORE, ZKSYNC_XVS_BRIDGE_AMOUNT);
  });

  testForkedNetworkVipCommands("VIP 549", await vip549());

  describe("Post-VIP behaviour", async () => {
    it("check xvs balance", async () => {
      const currentBalance = await xvs.balanceOf(ZKSYNC_XVS_STORE);
      expect(currentBalance).to.equals(previousBalanceXVSStore.add(ZKSYNC_XVS_BRIDGE_AMOUNT));
    });

    it("should update the XVS distribution speed", async () => {
      const speed = await xvsVault.rewardTokenAmountsPerBlockOrSecond(zksyncmainnet.XVS);
      expect(speed).to.equal(ZKSYNC_SPEED);
    })
  });
});
