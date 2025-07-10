import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip530, {
  RewardsDistributor_Core_0_Amount_UNICHAIN,
  RewardsDistributor_Core_0_UNICHAIN,
} from "../../vips/vip-530/bscmainnet";
import XVS_ABI from "./abi/XVS.json";

const { unichainmainnet } = NETWORK_ADDRESSES;
const BRIDGE = "0x9c95f8aa28fFEB7ECdC0c407B9F632419c5daAF8";

forking(21389776, async () => {
  const xvs = new ethers.Contract(unichainmainnet.XVS, XVS_ABI, ethers.provider);
  let previousBalanceRewardDistributorCore: BigNumber;
  let previousBalanceTreasury: BigNumber;

  before(async () => {
    previousBalanceTreasury = await xvs.balanceOf(unichainmainnet.VTREASURY);

    await impersonateAccount(BRIDGE);
    await setBalance(BRIDGE, parseUnits("10", 18));
    await xvs
      .connect(await ethers.getSigner(BRIDGE))
      .mint(unichainmainnet.VTREASURY, RewardsDistributor_Core_0_Amount_UNICHAIN);

    previousBalanceRewardDistributorCore = await xvs.balanceOf(RewardsDistributor_Core_0_UNICHAIN);
  });

  testForkedNetworkVipCommands("VIP 530", await vip530());

  describe("Post-VIP behaviour", async () => {
    it("check xvs balance", async () => {
      const currentBalanceRewardDistributorCore = await xvs.balanceOf(RewardsDistributor_Core_0_UNICHAIN);
      expect(currentBalanceRewardDistributorCore).to.equals(
        previousBalanceRewardDistributorCore.add(RewardsDistributor_Core_0_Amount_UNICHAIN),
      );
    });

    it("check treasury balance", async () => {
      const currentBalance = await xvs.balanceOf(unichainmainnet.VTREASURY);
      expect(currentBalance).to.equals(previousBalanceTreasury);
    });
  });
});
