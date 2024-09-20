import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
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

import vip010, {
  COMPTROLLER_CORE,
  RD_XVS_REWARD_AMOUNT,
  REWARD_DISTRIBUTOR_CORE_0,
  REWARD_TOKEN_SPEED,
  STORE_XVS_REWARD_AMOUNT,
  VUSDC_E_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_CORE,
  VZK_CORE,
  XVS,
  XVS_STORE,
  XVS_VAULT_PROXY,
} from "../../../proposals/zksyncmainnet/vip-010";
import XVS_VAULT_ABI from "./abi/XVSVaultProxy.json";
import XVS_ABI from "./abi/xvs.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;

const TREASURY_AMOUNT = parseUnits("37500", 18);
const BRIDGE = "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116";

forking(44579033, async () => {
  const provider = ethers.provider;
  let xvsVault: Contract;
  let xvs: Contract;
  let treasuryBalanceBefore: BigNumber;
  let bridgeSigner: SignerWithAddress;

  describe("Pre-VIP behaviour", async () => {
    before(async () => {
      bridgeSigner = await initMainnetUser(BRIDGE, parseUnits("1", 18));

      xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      xvs = new ethers.Contract(XVS, XVS_ABI, provider);

      await xvs.connect(bridgeSigner).mint(zksyncmainnet.VTREASURY, TREASURY_AMOUNT);
    });

    it("vTreasury should hold atleast 37500 XVS", async () => {
      expect(await xvs.balanceOf(zksyncmainnet.VTREASURY)).to.be.gte(TREASURY_AMOUNT);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      xvsVault = new ethers.Contract(XVS_VAULT_PROXY, XVS_VAULT_ABI, provider);
      xvs = new ethers.Contract(XVS, XVS_ABI, provider);
      treasuryBalanceBefore = await xvs.balanceOf(zksyncmainnet.VTREASURY);
      await pretendExecutingVip(await vip010());
    });

    it("vTreasury balance should be updated", async () => {
      expect(await xvs.balanceOf(zksyncmainnet.VTREASURY)).to.be.equal(treasuryBalanceBefore.sub(TREASURY_AMOUNT));
    });

    it("rewards distributor should have expected number of xvs tokens", async () => {
      expect(await xvs.balanceOf(REWARD_DISTRIBUTOR_CORE_0)).to.be.equal(RD_XVS_REWARD_AMOUNT);
    });

    it("should have correct reward speed", async () => {
      expect(await xvsVault.rewardTokenAmountsPerBlockOrSecond(XVS)).to.be.equal(REWARD_TOKEN_SPEED);
    });

    it("xvs store should have 6000 xvs", async () => {
      expect(await xvs.balanceOf(XVS_STORE)).to.be.equal(STORE_XVS_REWARD_AMOUNT);
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
          supplySpeed: "555555555555554",
          borrowSpeed: "138888888888888",
          totalRewardsToDistribute: parseUnits("1800", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VUSDC_E_CORE,
          supplySpeed: "1111111111111110",
          borrowSpeed: "277777777777776",
          totalRewardsToDistribute: parseUnits("3600", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VWBTC_CORE,
          supplySpeed: "740740740740740",
          borrowSpeed: "185185185185184",
          totalRewardsToDistribute: parseUnits("2400", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VWETH_CORE,
          supplySpeed: "740740740740740",
          borrowSpeed: "185185185185184",
          totalRewardsToDistribute: parseUnits("2400", 18),
        },
        {
          ...rewardBasicConfig,
          vToken: VZK_CORE,
          supplySpeed: "555555555555554",
          borrowSpeed: "138888888888888",
          totalRewardsToDistribute: parseUnits("1800", 18),
        },
      ];

      for (const config of tokensRewardConfig) {
        checkRewardsDistributor("RewardsDistributor_Core_0_XVS", config);
      }
    });
  });
});
