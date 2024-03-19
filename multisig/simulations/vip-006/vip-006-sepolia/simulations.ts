import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "../../../../src/vip-framework/checks/rewardsDistributor";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import {
  COMPTROLLER_CORE,
  COMPTROLLER_CURVE,
  COMPTROLLER_LST,
  CRV,
  REWARD_DISTRIBUTOR_CORE_0,
  REWARD_DISTRIBUTOR_CORE_1,
  REWARD_DISTRIBUTOR_CORE_2,
  REWARD_DISTRIBUTOR_CORE_3,
  REWARD_DISTRIBUTOR_CURVE_0,
  REWARD_DISTRIBUTOR_CURVE_1,
  REWARD_DISTRIBUTOR_CURVE_2,
  REWARD_DISTRIBUTOR_LST_0,
  REWARD_DISTRIBUTOR_LST_1,
  REWARD_DISTRIBUTOR_LST_2,
  VCRVUSD_CORE,
  VCRVUSD_CURVE,
  VCRV_CURVE,
  VUSDC_CORE,
  VUSDT_CORE,
  VWBTC_CORE,
  VWETH_CORE,
  VWETH_LST,
  VWSTETH_LST,
  WSTETH,
  XVS,
  vip006,
} from "../../../proposals/vip-006/vip-006-sepolia";

const BLOCKS_IN_90_DAYS = BigNumber.from(648_000); // assuming 12 sec block ==> 7200 blocks per day

forking(5518286, () => {
  describe("Generic checks", async () => {
    before(async () => {
      await pretendExecutingVip(vip006());
    });

    checkRewardsDistributorPool(COMPTROLLER_CORE, 4);
    checkRewardsDistributorPool(COMPTROLLER_CURVE, 3);
    checkRewardsDistributorPool(COMPTROLLER_LST, 3);

    const wethCoreRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VWETH_CORE,
      borrowSpeed: "41666666664000",
      supplySpeed: "27777777776000",
      totalRewardsToDistribute: parseUnits("45", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0", wethCoreRewardsDistributorConfig);

    const wbtcRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_1,
      token: XVS,
      vToken: VWBTC_CORE,
      borrowSpeed: "125000000000000",
      supplySpeed: "83333333320000",
      totalRewardsToDistribute: parseUnits("405", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_1_VWBTC", wbtcRewardsDistributorConfig);

    const usdtRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_1,
      token: XVS,
      vToken: VUSDT_CORE,
      borrowSpeed: "125000000000000",
      supplySpeed: "83333333320000",
      totalRewardsToDistribute: parseUnits("405", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_1_USDT", usdtRewardsDistributorConfig);

    const usdcRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_1,
      token: XVS,
      vToken: VUSDC_CORE,
      borrowSpeed: "125000000000000",
      supplySpeed: "83333333320000",
      totalRewardsToDistribute: parseUnits("405", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_1_USDT", usdcRewardsDistributorConfig);

    const vcrvUSDRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_2,
      token: XVS,
      vToken: VCRVUSD_CORE,
      borrowSpeed: "55555555554000",
      supplySpeed: "37037037036000",
      totalRewardsToDistribute: parseUnits("60", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_2", vcrvUSDRewardsDistributorConfig);

    const vcrvUSDCRVRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_3,
      token: CRV,
      vToken: VCRVUSD_CORE,
      borrowSpeed: "1157407408000000",
      supplySpeed: "771604938400000",
      totalRewardsToDistribute: parseUnits("1250", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_3", vcrvUSDCRVRewardsDistributorConfig);

    const crvRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CURVE,
      address: REWARD_DISTRIBUTOR_CURVE_0,
      token: XVS,
      vToken: VCRV_CURVE,
      borrowSpeed: "13888888890000",
      supplySpeed: "9259259260000",
      totalRewardsToDistribute: parseUnits("15", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Curve_0", crvRewardsDistributorConfig);

    const crvCurveRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CURVE,
      address: REWARD_DISTRIBUTOR_CURVE_1,
      token: XVS,
      vToken: VCRVUSD_CURVE,
      borrowSpeed: "55555555554000",
      supplySpeed: "37037037036000",
      totalRewardsToDistribute: parseUnits("60", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Curve_1", crvCurveRewardsDistributorConfig);

    const crvUSDCurveRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CURVE,
      address: REWARD_DISTRIBUTOR_CURVE_2,
      token: CRV,
      vToken: VCRVUSD_CURVE,
      borrowSpeed: "115740740800000000",
      supplySpeed: "77160493840000000",
      totalRewardsToDistribute: parseUnits("1250", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Curve_2", crvUSDCurveRewardsDistributorConfig);

    const wstETHXVSRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_LST,
      address: REWARD_DISTRIBUTOR_LST_0,
      token: XVS,
      vToken: VWSTETH_LST,
      borrowSpeed: "0",
      supplySpeed: "222222222200000",
      totalRewardsToDistribute: parseUnits("155", 18),
    };
    checkRewardsDistributor("RewardsDistributor_LST_0", wstETHXVSRewardsDistributorConfig);

    const wethLSTRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_LST,
      address: REWARD_DISTRIBUTOR_LST_1,
      token: XVS,
      vToken: VWETH_LST,
      borrowSpeed: "594135802500000",
      supplySpeed: "254629629600000",
      totalRewardsToDistribute: parseUnits("550", 18),
    };
    checkRewardsDistributor("RewardsDistributor_LST_1", wethLSTRewardsDistributorConfig);

    const wstETHLSTRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_LST,
      address: REWARD_DISTRIBUTOR_LST_2,
      token: WSTETH,
      vToken: VWSTETH_LST,
      borrowSpeed: "0",
      supplySpeed: "712962963000",
      totalRewardsToDistribute: parseUnits("0.154", 18),
    };
    checkRewardsDistributor("RewardsDistributor_LST_2", wstETHLSTRewardsDistributorConfig);
  });
});
