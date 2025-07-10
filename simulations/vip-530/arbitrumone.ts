import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip530, {
  RewardsDistributor_Core_0_ARB,
  RewardsDistributor_Core_0_Amount_ARB,
  RewardsDistributor_Liquid_Staked_ETH_0_ARB,
  RewardsDistributor_Liquid_Staked_ETH_0_Amount_ARB,
} from "../../vips/vip-530/bscmainnet";
import XVS_ABI from "./abi/XVS.json";

const { arbitrumone } = NETWORK_ADDRESSES;
const BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";

forking(356174917, async () => {
  const xvs = new ethers.Contract(arbitrumone.XVS, XVS_ABI, ethers.provider);
  let previousBalanceRewardDistributorCore: BigNumber;
  let previousBalanceRewardDistributorLiquidStakedEth: BigNumber;
  let previousBalanceTreasury: BigNumber;

  before(async () => {
    previousBalanceTreasury = await xvs.balanceOf(arbitrumone.VTREASURY);

    await impersonateAccount(BRIDGE);
    await setBalance(BRIDGE, parseUnits("10", 18));
    await xvs
      .connect(await ethers.getSigner(BRIDGE))
      .mint(
        arbitrumone.VTREASURY,
        RewardsDistributor_Core_0_Amount_ARB.add(RewardsDistributor_Liquid_Staked_ETH_0_Amount_ARB),
      );

    previousBalanceRewardDistributorCore = await xvs.balanceOf(RewardsDistributor_Core_0_ARB);
    previousBalanceRewardDistributorLiquidStakedEth = await xvs.balanceOf(RewardsDistributor_Liquid_Staked_ETH_0_ARB);
  });

  testForkedNetworkVipCommands("VIP 530", await vip530());

  describe("Post-VIP behaviour", async () => {
    it("check xvs balance", async () => {
      const currentBalanceRewardDistributorCore = await xvs.balanceOf(RewardsDistributor_Core_0_ARB);
      expect(currentBalanceRewardDistributorCore).to.equals(
        previousBalanceRewardDistributorCore.add(RewardsDistributor_Core_0_Amount_ARB),
      );

      const currentBalanceRewardDistributorLiquidStakedEth = await xvs.balanceOf(
        RewardsDistributor_Liquid_Staked_ETH_0_ARB,
      );
      expect(currentBalanceRewardDistributorLiquidStakedEth).to.equals(
        previousBalanceRewardDistributorLiquidStakedEth.add(RewardsDistributor_Liquid_Staked_ETH_0_Amount_ARB),
      );
    });

    it("check treasury balance", async () => {
      const currentBalance = await xvs.balanceOf(arbitrumone.VTREASURY);
      expect(currentBalance).to.equals(previousBalanceTreasury);
    });
  });
});
