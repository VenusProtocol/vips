import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip528, {
  DISTRIBUTION_SPEED_UNICHAIN,
  XVS_STORE_UNICHAIN,
  XVS_TOTAL_AMOUNT_UNICHAIN,
} from "../../vips/vip-528/bscmainnet";
import XVS_ABI from "./abi/XVS.json";
import XVS_VAULT_ABI from "./abi/XVSVault.json";

const { unichainmainnet } = NETWORK_ADDRESSES;
const BRIDGE = "0x9c95f8aa28fFEB7ECdC0c407B9F632419c5daAF8";

forking(20788301, async () => {
  const xvs = new ethers.Contract(unichainmainnet.XVS, XVS_ABI, ethers.provider);
  let previousBalance: BigNumber;

  before(async () => {
    await impersonateAccount(BRIDGE);
    await setBalance(BRIDGE, parseUnits("10", 18));
    await xvs.connect(await ethers.getSigner(BRIDGE)).mint(unichainmainnet.VTREASURY, XVS_TOTAL_AMOUNT_UNICHAIN);

    previousBalance = await xvs.balanceOf(XVS_STORE_UNICHAIN);
  });

  testForkedNetworkVipCommands("VIP 528", await vip528(), {
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

    it("check xvs balance", async () => {
      const currentBalance = await xvs.balanceOf(XVS_STORE_UNICHAIN);
      expect(currentBalance).to.equals(previousBalance.add(XVS_TOTAL_AMOUNT_UNICHAIN));
    });
  });
});
