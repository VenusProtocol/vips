import { setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip530, {
  RewardsDistributor_Core_0_Amount_ZKSYNC,
  RewardsDistributor_Core_0_ZKSYNC,
} from "../../vips/vip-530/bscmainnet";
import XVS_ABI from "./abi/XVS.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;
const BRIDGE = "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116";

forking(62675633, async () => {
  const xvs = new ethers.Contract(zksyncmainnet.XVS, XVS_ABI, ethers.provider);
  let previousBalanceRewardDistributorCore: BigNumber;
  let previousBalanceTreasury: BigNumber;

  before(async () => {
    previousBalanceTreasury = await xvs.balanceOf(zksyncmainnet.VTREASURY);

    const xvsMinter = await initMainnetUser(BRIDGE, ethers.utils.parseEther("1"));
    await setBalance(BRIDGE, parseUnits("10", 18));
    await xvs.connect(xvsMinter).mint(zksyncmainnet.VTREASURY, RewardsDistributor_Core_0_Amount_ZKSYNC);

    previousBalanceRewardDistributorCore = await xvs.balanceOf(RewardsDistributor_Core_0_ZKSYNC);
  });

  testForkedNetworkVipCommands("VIP 530", await vip530());

  describe("Post-VIP behaviour", async () => {
    it("check xvs balance", async () => {
      const currentBalanceRewardDistributorCore = await xvs.balanceOf(RewardsDistributor_Core_0_ZKSYNC);
      expect(currentBalanceRewardDistributorCore).to.equals(
        previousBalanceRewardDistributorCore.add(RewardsDistributor_Core_0_Amount_ZKSYNC),
      );
    });

    it("check treasury balance", async () => {
      const currentBalance = await xvs.balanceOf(zksyncmainnet.VTREASURY);
      expect(currentBalance).to.equals(previousBalanceTreasury);
    });
  });
});
