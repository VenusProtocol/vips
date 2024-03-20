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
  REWARD_DISTRIBUTOR_CURVE_0,
  REWARD_DISTRIBUTOR_CURVE_1,
  REWARD_DISTRIBUTOR_LST_0,
  REWARD_DISTRIBUTOR_LST_1,
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

forking(5523471, () => {
  describe("Generic checks", async () => {
    before(async () => {
      await pretendExecutingVip(vip006());
    });

    checkRewardsDistributorPool(COMPTROLLER_CORE, 2);
    checkRewardsDistributorPool(COMPTROLLER_CURVE, 2);
    checkRewardsDistributorPool(COMPTROLLER_LST, 2);

    const wethCoreRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VWETH_CORE,
      borrowSpeed: "41666666666666",
      supplySpeed: "27777777777777",
      totalRewardsToDistribute: parseUnits("510", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_WETH", wethCoreRewardsDistributorConfig);

    const wbtcRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VWBTC_CORE,
      borrowSpeed: "125000000000000",
      supplySpeed: "83333333333333",
      totalRewardsToDistribute: parseUnits("510", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_VWBTC", wbtcRewardsDistributorConfig);

    const usdtRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VUSDT_CORE,
      borrowSpeed: "125000000000000",
      supplySpeed: "83333333333333",
      totalRewardsToDistribute: parseUnits("510", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_USDT", usdtRewardsDistributorConfig);

    const usdcRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VUSDC_CORE,
      borrowSpeed: "125000000000000",
      supplySpeed: "83333333333333",
      totalRewardsToDistribute: parseUnits("510", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_USDC", usdcRewardsDistributorConfig);

    const vcrvUSDRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VCRVUSD_CORE,
      borrowSpeed: "55555555555555",
      supplySpeed: "37037037037036",
      totalRewardsToDistribute: parseUnits("510", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_CRVUSD", vcrvUSDRewardsDistributorConfig);

    const vcrvUSDCRVRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_1,
      token: CRV,
      vToken: VCRVUSD_CORE,
      borrowSpeed: "1157407407407407",
      supplySpeed: "771604938271604",
      totalRewardsToDistribute: parseUnits("1250", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_1", vcrvUSDCRVRewardsDistributorConfig);

    const crvRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CURVE,
      address: REWARD_DISTRIBUTOR_CURVE_0,
      token: XVS,
      vToken: VCRV_CURVE,
      borrowSpeed: "13888888888888",
      supplySpeed: "9259259259259",
      totalRewardsToDistribute: parseUnits("75", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Curve_0_CRV", crvRewardsDistributorConfig);

    const crvCurveRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CURVE,
      address: REWARD_DISTRIBUTOR_CURVE_0,
      token: XVS,
      vToken: VCRVUSD_CURVE,
      borrowSpeed: "55555555555555",
      supplySpeed: "37037037037037",
      totalRewardsToDistribute: parseUnits("75", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Curve_0_CRVUSD", crvCurveRewardsDistributorConfig);

    const crvUSDCurveRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CURVE,
      address: REWARD_DISTRIBUTOR_CURVE_1,
      token: CRV,
      vToken: VCRVUSD_CURVE,
      borrowSpeed: "1157407407407407",
      supplySpeed: "771604938271604",
      totalRewardsToDistribute: parseUnits("1250", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Curve_1_CRVUSD", crvUSDCurveRewardsDistributorConfig);

    const wstETHXVSRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_LST,
      address: REWARD_DISTRIBUTOR_LST_0,
      token: XVS,
      vToken: VWSTETH_LST,
      borrowSpeed: "0",
      supplySpeed: "222222222222222",
      totalRewardsToDistribute: parseUnits("705", 18),
    };
    checkRewardsDistributor("RewardsDistributor_LST_0_WSTETH", wstETHXVSRewardsDistributorConfig);

    const wethLSTRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_LST,
      address: REWARD_DISTRIBUTOR_LST_0,
      token: XVS,
      vToken: VWETH_LST,
      borrowSpeed: "594135802469135",
      supplySpeed: "254629629629629",
      totalRewardsToDistribute: parseUnits("705", 18),
    };
    checkRewardsDistributor("RewardsDistributor_LST_0_WETH", wethLSTRewardsDistributorConfig);

    const wstETHLSTRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_LST,
      address: REWARD_DISTRIBUTOR_LST_1,
      token: WSTETH,
      vToken: VWSTETH_LST,
      borrowSpeed: "0",
      supplySpeed: "712962962962",
      totalRewardsToDistribute: parseUnits("0.154", 18),
    };
    checkRewardsDistributor("RewardsDistributor_LST_1_WSTETH", wstETHLSTRewardsDistributorConfig);
  });
});
