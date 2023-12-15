import { parseUnits } from "ethers/lib/utils";

import { checkXVSVault } from "../../../../src/vip-framework/checks/checkXVSVault";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../../../src/vip-framework/checks/rewardsDistributor";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import {
  REWARD_DISTRIBUTOR_CORE_0,
  REWARD_DISTRIBUTOR_CORE_1,
  REWARD_DISTRIBUTOR_CORE_2,
  REWARD_DISTRIBUTOR_CORE_3,
  vip006,
} from "../../../proposals/vip-006/vip-006-sepolia";

const COMPTROLLER_CORE = "0x7Aa39ab4BcA897F403425C9C6FDbd0f882Be0D70";
const XVS = "0xDb633C11D3F9E6B8D17aC2c972C9e3B05DA59bF9";
const VUSDC_CORE = "0xF87bceab8DD37489015B426bA931e08A4D787616";
const VUSDT_CORE = "0x19252AFD0B2F539C400aEab7d460CBFbf74c17ff";
const VWBTC_CORE = "0x74E708A7F5486ed73CCCAe54B63e71B1988F1383";
const VWETH_CORE = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";

forking(4837900, () => {
  describe("Generic checks", async () => {
    before(async () => {
      await pretendExecutingVip(vip006());
    });

    checkRewardsDistributorPool(COMPTROLLER_CORE, 4);
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
