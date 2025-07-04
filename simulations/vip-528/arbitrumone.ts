import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip528, {
  DISTRIBUTION_SPEED_ARB,
  RELEASE_AMOUNT_ARB,
  XVS_STORE_ARB,
  XVS_TOTAL_AMOUNT_ARB,
} from "../../vips/vip-528/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { arbitrumone } = NETWORK_ADDRESSES;
const BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";

forking(353742639, async () => {
  const xvs = new ethers.Contract(arbitrumone.XVS, XVS_ABI, ethers.provider);
  let previousBalanceXVSStore: BigNumber;
  let previousBalanceTreasury: BigNumber;

  before(async () => {
    previousBalanceTreasury = await xvs.balanceOf(arbitrumone.VTREASURY);

    await impersonateAccount(BRIDGE);
    await setBalance(BRIDGE, parseUnits("10", 18));
    await xvs.connect(await ethers.getSigner(BRIDGE)).mint(arbitrumone.VTREASURY, XVS_TOTAL_AMOUNT_ARB);

    previousBalanceXVSStore = await xvs.balanceOf(XVS_STORE_ARB);
  });

  testForkedNetworkVipCommands("VIP 528", await vip528(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [XVS_VAULT_ABI], ["RewardAmountUpdated"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("check xvs vault speed", async () => {
      const xvsVault = new ethers.Contract(arbitrumone.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(arbitrumone.XVS)).to.equals(DISTRIBUTION_SPEED_ARB);
    });

    it("check xvs balance", async () => {
      const currentBalance = await xvs.balanceOf(XVS_STORE_ARB);
      expect(currentBalance).to.equals(previousBalanceXVSStore.add(XVS_TOTAL_AMOUNT_ARB).add(RELEASE_AMOUNT_ARB));
    });

    it("check treasury balance", async () => {
      const currentBalance = await xvs.balanceOf(arbitrumone.VTREASURY);
      expect(currentBalance).to.equals(previousBalanceTreasury);
    });
  });
});
