import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../../../src/vip-framework/checks/rewardsDistributor";
import vip008, {
  COMPTROLLER_CORE,
  REWARD_DISTRIBUTOR_CORE_0,
  VARB_CORE,
  VTREASURY,
  VUSDC_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_CORE,
  XVS,
  XVS_AMOUNT,
  XVS_STORE,
  XVS_VAULT_PROXY,
  XVS_VAULT_REWARDS_SPEED,
} from "../../../proposals/arbitrumone/vip-008";
import XVS_VAULT_ABI from "./abi/XVSVaultProxy.json";
import XVS_ABI from "./abi/xvs.json";

const BRIDGE = "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6";
const TREAUSRY_AMOUNT = parseUnits("30000", 18);

forking(221153914, () => {
  const provider = ethers.provider;
  let bridgeSigner: Signer;
  let xvsVault: Contract;
  let xvs: Contract;

  describe("Pre-VIP behaviour", async () => {
    before(async () => {
      bridgeSigner = await initMainnetUser(BRIDGE, parseUnits("1", 18));

      xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      xvs = new ethers.Contract(XVS, XVS_ABI, provider);

      await xvs.connect(bridgeSigner).mint(VTREASURY, TREAUSRY_AMOUNT);
    });

    it("vTreasury should hold 30000 XVS", async () => {
      expect(await xvs.balanceOf(VTREASURY)).to.be.equal(TREAUSRY_AMOUNT);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      xvs = new ethers.Contract(XVS, XVS_ABI, provider);
      await pretendExecutingVip(vip008());
    });

    it("vTreasury should hold 15300 XVS", async () => {
      expect(await xvs.balanceOf(VTREASURY)).to.be.equal(parseUnits("15300", 18));
    });

    it("rewards distributor should have expected number of xvs tokens", async () => {
      expect(await xvs.balanceOf(REWARD_DISTRIBUTOR_CORE_0)).to.be.equal(parseUnits("10200", 18));
    });

    it("vault should be enabled", async () => {
      expect(await xvsVault.vaultPaused()).to.be.equal(false);
    });

    it("should have correct reward speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(XVS)).to.be.equal(XVS_VAULT_REWARDS_SPEED);
    });

    it("xvs store should have 4500 xvs", async () => {
      expect(await xvs.balanceOf(XVS_STORE)).to.be.equal(XVS_AMOUNT);
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
          borrowSpeed: "196759259259258",
          supplySpeed: "131172839506172",
          totalRewardsToDistribute: parseUnits("2550", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VUSDC_CORE,
          borrowSpeed: "196759259259258",
          supplySpeed: "131172839506172",
          totalRewardsToDistribute: parseUnits("2550", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VWBTC_CORE,
          borrowSpeed: "196759259259258",
          supplySpeed: "131172839506172",
          totalRewardsToDistribute: parseUnits("2550", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VWETH_CORE,
          borrowSpeed: "98379629629629",
          supplySpeed: "65586419753086",
          totalRewardsToDistribute: parseUnits("1275", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VARB_CORE,
          borrowSpeed: "98379629629629",
          supplySpeed: "65586419753086",
          totalRewardsToDistribute: parseUnits("1275", 18),
        },
      ];

      for (const config of tokensRewardConfig) {
        checkRewardsDistributor("RewardsDistributor_Core_0_XVS", config);
      }
    });
  });
});
