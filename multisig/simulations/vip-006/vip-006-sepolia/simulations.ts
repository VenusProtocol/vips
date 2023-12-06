import { parseUnits } from "ethers/lib/utils";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../../../src/vip-framework/checks/rewardsDistributor";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import { vip006 } from "../../../proposals/vip-006/vip-006-sepolia";

const { sepolia } = NETWORK_ADDRESSES;
export const REWARD_DISTRIBUTOR_CORE_0 = "0xEA3bb4A1C6218E31e435F3c23E0E9a05A40B7F40";
export const REWARD_DISTRIBUTOR_CORE_1 = "0xAbBAe88E3E62D6Ffb23D084bDFD2A1Dc45e15879";
export const REWARD_DISTRIBUTOR_CORE_2 = "0x6B3f9BBbBC8595f9c3C8e0082E95C45F98239E1b";
export const REWARD_DISTRIBUTOR_CORE_3 = "0x5e128F6B554589D3B1E91D53Aee161A70F439062";

forking(4833170, () => {
  describe("Generic checks", async () => {
    before(async () => {
      await pretendExecutingVip(vip006());
    });

    checkRewardsDistributorPool(sepolia.COMPTROLLER_CORE, 4);

    const wbtcRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: sepolia.COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: sepolia.XVS,
      vToken: sepolia.VWBTC_CORE,
      borrowSpeed: parseUnits("1000", 18).div(2).div(2628000),
      supplySpeed: parseUnits("1000", 18).div(2).div(2628000),
      totalRewardsToDistribute: parseUnits("1000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0", wbtcRewardsDistributorConfig);

    const wethRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: sepolia.COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_1,
      token: sepolia.XVS,
      vToken: sepolia.VWETH_CORE,
      borrowSpeed: parseUnits("1000", 18).div(2).div(2628000),
      supplySpeed: parseUnits("1000", 18).div(2).div(2628000),
      totalRewardsToDistribute: parseUnits("1000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_1", wethRewardsDistributorConfig);

    const usdcRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: sepolia.COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_2,
      token: sepolia.XVS,
      vToken: sepolia.VUSDC_CORE,
      borrowSpeed: parseUnits("1000", 18).div(2).div(2628000),
      supplySpeed: parseUnits("1000", 18).div(2).div(2628000),
      totalRewardsToDistribute: parseUnits("1000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_2", usdcRewardsDistributorConfig);

    const usdtRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: sepolia.COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_3,
      token: sepolia.XVS,
      vToken: sepolia.VUSDT_CORE,
      borrowSpeed: parseUnits("1000", 18).div(2).div(2628000),
      supplySpeed: parseUnits("1000", 18).div(2).div(2628000),
      totalRewardsToDistribute: parseUnits("1000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_3", usdtRewardsDistributorConfig);
  });
});
