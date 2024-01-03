import { parseUnits } from "ethers/lib/utils";

import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../../../src/vip-framework/checks/rewardsDistributor";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import {
  COMPTROLLER_CORE,
  REWARD_DISTRIBUTOR_CORE_0,
  REWARD_DISTRIBUTOR_CORE_1,
  REWARD_DISTRIBUTOR_CORE_2,
  REWARD_DISTRIBUTOR_CORE_3,
  VUSDC_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_CORE,
  XVS,
  vip006,
} from "../../../proposals/vip-006/vip-006-sepolia";

forking(5005859, () => {
  describe("Generic checks", async () => {
    before(async () => {
      await pretendExecutingVip(vip006());
    });

    checkRewardsDistributorPool(COMPTROLLER_CORE, 8);
    checkXVSVault();

    const wbtcRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VWBTC_CORE,
      borrowSpeed: parseUnits("1000", 18).div(2).div(2628000),
      supplySpeed: parseUnits("1000", 18).div(2).div(2628000),
      totalRewardsToDistribute: parseUnits("1000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0", wbtcRewardsDistributorConfig);

    const wethRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_1,
      token: XVS,
      vToken: VWETH_CORE,
      borrowSpeed: parseUnits("1000", 18).div(2).div(2628000),
      supplySpeed: parseUnits("1000", 18).div(2).div(2628000),
      totalRewardsToDistribute: parseUnits("1000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_1", wethRewardsDistributorConfig);

    const usdcRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_2,
      token: XVS,
      vToken: VUSDC_CORE,
      borrowSpeed: parseUnits("1000", 18).div(2).div(2628000),
      supplySpeed: parseUnits("1000", 18).div(2).div(2628000),
      totalRewardsToDistribute: parseUnits("1000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_2", usdcRewardsDistributorConfig);

    const usdtRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_3,
      token: XVS,
      vToken: VUSDT_CORE,
      borrowSpeed: parseUnits("1000", 18).div(2).div(2628000),
      supplySpeed: parseUnits("1000", 18).div(2).div(2628000),
      totalRewardsToDistribute: parseUnits("1000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_3", usdtRewardsDistributorConfig);
  });
});
