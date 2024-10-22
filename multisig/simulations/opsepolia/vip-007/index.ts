import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip } from "src/vip-framework";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "src/vip-framework/checks/rewardsDistributor";

import vip007, {
  COMPTROLLER_CORE,
  REWARD_DISTRIBUTOR_CORE_0,
  VOP_CORE,
  VUSDC_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_CORE,
  XVS_STORE,
  XVS_STORE_AMOUNT,
  XVS_VAULT_REWARDS_SPEED,
} from "../../../proposals/opsepolia/vip-007";
import XVS_VAULT_ABI from "./abi/XVSVaultProxy.json";
import XVS_ABI from "./abi/xvs.json";

const { opsepolia } = NETWORK_ADDRESSES;

forking(17385407, async () => {
  const provider = ethers.provider;
  let xvsVault: Contract;
  let xvs: Contract;

  describe("Post-VIP behavior", async () => {
    before(async () => {
      const bridge = "0x79a36dc9a43d05db4747c59c02f48ed500e47df1";
      const signer = await initMainnetUser(bridge, parseUnits("1", 18));
      xvsVault = new ethers.Contract(opsepolia.XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      xvs = new ethers.Contract(opsepolia.XVS, XVS_ABI, provider);
      await xvs.connect(signer).mint(opsepolia.VTREASURY, parseUnits("8600", 18));
      await pretendExecutingVip(await vip007());
    });

    it("rewards distributor should have expected number of xvs tokens", async () => {
      expect(await xvs.balanceOf(REWARD_DISTRIBUTOR_CORE_0)).to.be.equal(parseUnits("3600", 18));
    });

    it("vault should be enabled", async () => {
      expect(await xvsVault.vaultPaused()).to.be.equal(false);
    });

    it("should have correct reward speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(opsepolia.XVS)).to.be.equal(XVS_VAULT_REWARDS_SPEED);
    });

    it("xvs store should have 5000 xvs", async () => {
      expect(await xvs.balanceOf(XVS_STORE)).to.be.equal(XVS_STORE_AMOUNT);
    });

    const rewardBasicConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: opsepolia.XVS,
    };
    describe("Generic checks", async () => {
      checkRewardsDistributorPool(COMPTROLLER_CORE, 1);

      const tokensRewardConfig: RewardsDistributorConfig[] = [
        {
          ...rewardBasicConfig,
          vToken: VUSDT_CORE,
          borrowSpeed: "1157407407407",
          supplySpeed: "1157407407407",
          totalRewardsToDistribute: parseUnits("720", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VUSDC_CORE,
          borrowSpeed: "1157407407407",
          supplySpeed: "1157407407407",
          totalRewardsToDistribute: parseUnits("720", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VWBTC_CORE,
          borrowSpeed: "1157407407407",
          supplySpeed: "1157407407407",
          totalRewardsToDistribute: parseUnits("720", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VWETH_CORE,
          borrowSpeed: "1157407407407",
          supplySpeed: "1157407407407",
          totalRewardsToDistribute: parseUnits("720", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VOP_CORE,
          borrowSpeed: "1157407407407",
          supplySpeed: "1157407407407",
          totalRewardsToDistribute: parseUnits("720", 18),
        },
      ];

      for (const config of tokensRewardConfig) {
        checkRewardsDistributor("RewardsDistributor_Core_0_XVS", config);
      }
    });
  });
});
