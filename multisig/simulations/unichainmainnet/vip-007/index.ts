import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { initMainnetUser } from "src/utils";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "src/vip-framework/checks/rewardsDistributor";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import {
  COMPTROLLER_CORE,
  REWARD_DISTRIBUTOR_CORE_0,
  REWARD_TOKEN_SPEED,
  VUSDC_CORE,
  VWETH_CORE,
  XVS,
  XVS_REWARD_AMOUNT,
  XVS_STORE,
  vip007,
} from "../../../proposals/unichainmainnet/vip-007";
import XVS_ABI from "./abi/xvs.json";
import XVS_VAULT_ABI from "./abi/xvsvault.json";

const { unichainmainnet } = NETWORK_ADDRESSES;

const XVS_PROXY_OFT_DEST = "0x9c95f8aa28fFEB7ECdC0c407B9F632419c5daAF8";
const TREASURY_AMOUNT = parseUnits("19500", 18);

forking(8711530, async () => {
  let xvs: Contract;
  let xvsVault: Contract;
  describe("Post VIP checks", async () => {
    before(async () => {
      xvs = new ethers.Contract(XVS, XVS_ABI, ethers.provider);

      xvsVault = new ethers.Contract(unichainmainnet.XVS_VAULT_PROXY, XVS_VAULT_ABI, ethers.provider);

      const impersonateBridge = await initMainnetUser(XVS_PROXY_OFT_DEST, ethers.utils.parseEther("2"));

      await xvs.connect(impersonateBridge).mint(unichainmainnet.VTREASURY, TREASURY_AMOUNT);

      await pretendExecutingVip(await vip007());
    });

    it("rewards distributor should have expected number of xvs tokens", async () => {
      expect(await xvs.balanceOf(REWARD_DISTRIBUTOR_CORE_0)).to.be.equal(parseUnits("18000", 18));
    });

    it("should have correct reward speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(XVS)).to.be.equal(REWARD_TOKEN_SPEED);
    });

    it("xvs store should have 1500 xvs", async () => {
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
          vToken: VUSDC_CORE,
          borrowSpeed: "192901234567901",
          supplySpeed: "578703703703704",
          totalRewardsToDistribute: parseUnits("18000", 18),
        },

        {
          ...rewardBasicConfig,
          vToken: VWETH_CORE,
          borrowSpeed: "192901234567901",
          supplySpeed: "578703703703704",
          totalRewardsToDistribute: parseUnits("18000", 18),
        },
      ];

      for (const config of tokensRewardConfig) {
        checkRewardsDistributor("RewardsDistributor_Core_0_XVS", config);
      }
    });
  });
});
