import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "src/vip-framework/checks/rewardsDistributor";

import vip007, {
  COMPTROLLER_CORE,
  REWARD_DISTRIBUTOR_CORE_0,
  REWARD_TOKEN_SPEED,
  VUSDC_E_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_CORE,
  VZK_CORE,
  XVS,
  XVS_REWARD_AMOUNT,
  XVS_STORE,
  XVS_VAULT_PROXY,
} from "../../../proposals/zksyncsepolia/vip-007";
import XVS_VAULT_ABI from "./abi/XVSVaultProxy.json";
import XVS_ABI from "./abi/xvs.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

const TREASURY_AMOUNT = parseUnits("7200", 18);

forking(3613959, async () => {
  const provider = ethers.provider;
  let xvsVault: Contract;
  let xvs: Contract;
  let treasuryBalanceBefore: BigNumber;

  describe("Pre-VIP behaviour", async () => {
    before(async () => {
      xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      xvs = new ethers.Contract(XVS, XVS_ABI, provider);
    });

    it("vTreasury should hold atleast 7200 XVS", async () => {
      expect(await xvs.balanceOf(zksyncsepolia.VTREASURY)).to.be.gt(TREASURY_AMOUNT);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      xvs = new ethers.Contract(XVS, XVS_ABI, provider);
      treasuryBalanceBefore = await xvs.balanceOf(zksyncsepolia.VTREASURY);
      await pretendExecutingVip(await vip007());
    });

    it("vTreasury balance should be updated", async () => {
      expect(await xvs.balanceOf(zksyncsepolia.VTREASURY)).to.be.equal(treasuryBalanceBefore.sub(TREASURY_AMOUNT));
    });

    it("rewards distributor should have expected number of xvs tokens", async () => {
      expect(await xvs.balanceOf(REWARD_DISTRIBUTOR_CORE_0)).to.be.equal(parseUnits("3600", 18));
    });

    it("should have correct reward speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(XVS)).to.be.equal(REWARD_TOKEN_SPEED);
    });

    it("xvs store should have 3600 xvs", async () => {
      expect(await xvs.balanceOf(XVS_STORE)).to.be.equal(XVS_REWARD_AMOUNT);
    });

    const rewardBasicConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
    };
    describe("Generic checks", async () => {
      checkRewardsDistributorPool(COMPTROLLER_CORE, 1);

      const tokensRewardConfig: RewardsDistributorConfig[] = [
        {
          ...rewardBasicConfig,
          vToken: VUSDT_CORE,
          borrowSpeed: "1157407407407",
          supplySpeed: "1157407407407",
          totalRewardsToDistribute: parseUnits("360", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VUSDC_E_CORE,
          borrowSpeed: "1157407407407",
          supplySpeed: "1157407407407",
          totalRewardsToDistribute: parseUnits("360", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VWBTC_CORE,
          borrowSpeed: "1157407407407",
          supplySpeed: "1157407407407",
          totalRewardsToDistribute: parseUnits("360", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VWETH_CORE,
          borrowSpeed: "1157407407407",
          supplySpeed: "1157407407407",
          totalRewardsToDistribute: parseUnits("360", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VZK_CORE,
          borrowSpeed: "1157407407407",
          supplySpeed: "1157407407407",
          totalRewardsToDistribute: parseUnits("360", 18),
        },
      ];

      for (const config of tokensRewardConfig) {
        checkRewardsDistributor("RewardsDistributor_Core_0_XVS", config);
      }
    });
  });
});
