import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip529, {
  DISTRIBUTION_SPEED_ZKSYNC,
  XVS_STORE_ZKSYNC,
  XVS_TOTAL_AMOUNT_ZKSYNC,
} from "../../vips/vip-529/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;
const BRIDGE = "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116";

forking(62438618, async () => {
  const xvs = new ethers.Contract(zksyncmainnet.XVS, XVS_ABI, ethers.provider);
  let previousBalanceXVSStore: BigNumber;
  let previousBalanceTreasury: BigNumber;

  before(async () => {
    previousBalanceTreasury = await xvs.balanceOf(zksyncmainnet.VTREASURY);
    const xvsMinter = await initMainnetUser(BRIDGE, ethers.utils.parseEther("1"));
    await setBalance(BRIDGE, parseUnits("10", 18));
    await xvs.connect(xvsMinter).mint(zksyncmainnet.VTREASURY, XVS_TOTAL_AMOUNT_ZKSYNC);

    previousBalanceXVSStore = await xvs.balanceOf(XVS_STORE_ZKSYNC);
  });

  testForkedNetworkVipCommands("VIP 529", await vip529(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check xvs vault speed", async () => {
      const xvsVault = new ethers.Contract(zksyncmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(zksyncmainnet.XVS)).to.equals(DISTRIBUTION_SPEED_ZKSYNC);
    });

    it("check xvs balance", async () => {
      const currentBalance = await xvs.balanceOf(XVS_STORE_ZKSYNC);
      expect(currentBalance).to.equals(previousBalanceXVSStore.add(XVS_TOTAL_AMOUNT_ZKSYNC));
    });

    it("check treasury balance", async () => {
      const currentBalance = await xvs.balanceOf(zksyncmainnet.VTREASURY);
      expect(currentBalance).to.equals(previousBalanceTreasury);
    });
  });
});
