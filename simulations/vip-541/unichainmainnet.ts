import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip541, {
  REWARD_DISTRIBUTOR_UNICHAIN,
  XVS_BRIDGE_UNICHAIN,
  XVS_SHORTAGE_UNICHAIN,
} from "../../vips/vip-541/bscmainnet";
import XVS_ABI from "./abi/XVS.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

forking(26697459, async () => {
  const xvs = new ethers.Contract(unichainmainnet.XVS, XVS_ABI, ethers.provider);
  let previousBalanceRewardDistributor: BigNumber;
  let previousBalanceTreasury: BigNumber;

  before(async () => {
    previousBalanceTreasury = await xvs.balanceOf(unichainmainnet.VTREASURY);

    await impersonateAccount(XVS_BRIDGE_UNICHAIN);
    await setBalance(XVS_BRIDGE_UNICHAIN, parseUnits("10", 18));
    await xvs
      .connect(await ethers.getSigner(XVS_BRIDGE_UNICHAIN))
      .mint(unichainmainnet.VTREASURY, XVS_SHORTAGE_UNICHAIN);

    previousBalanceRewardDistributor = await xvs.balanceOf(REWARD_DISTRIBUTOR_UNICHAIN);
  });

  testForkedNetworkVipCommands("VIP 541", await vip541());

  describe("Post-VIP behaviour", async () => {
    it("check xvs balance", async () => {
      const currentBalance = await xvs.balanceOf(REWARD_DISTRIBUTOR_UNICHAIN);
      expect(currentBalance).to.equals(previousBalanceRewardDistributor.add(XVS_SHORTAGE_UNICHAIN));
    });

    it("check treasury balance", async () => {
      const currentBalance = await xvs.balanceOf(unichainmainnet.VTREASURY);
      expect(currentBalance).to.equals(previousBalanceTreasury);
    });
  });
});
