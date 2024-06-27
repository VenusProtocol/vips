import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { initMainnetUser } from "src/utils";
import {
  RewardsDistributorConfig,
  checkRewardsDistributor,
  checkRewardsDistributorPool,
} from "src/vip-framework/checks/rewardsDistributor";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

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
} from "../../../proposals/ethereum/vip-006";
import { ETHEREUM_TREASURY, XVS, XVS_REWARD_AMOUNT, XVS_STORE, vip006 } from "../../../proposals/ethereum/vip-006/";
import XVS_ABI from "./abi/xvs.json";

const XVS_PROXY_OFT_DEST = "0x888E317606b4c590BBAD88653863e8B345702633";

forking(19483115, async () => {
  let xvs: Contract;
  let xvsStoreBalPrev: BigNumber;
  describe("Generic checks", async () => {
    before(async () => {
      xvs = new ethers.Contract(XVS, XVS_ABI, ethers.provider);
      const impersonateBridge = await initMainnetUser(XVS_PROXY_OFT_DEST, ethers.utils.parseEther("2"));
      await xvs.connect(impersonateBridge).mint(ETHEREUM_TREASURY, XVS_REWARD_AMOUNT);
      xvsStoreBalPrev = await xvs.balanceOf(XVS_STORE);
      await pretendExecutingVip(await vip006());
    });

    it("Should increase XVSStore balance", async () => {
      const currBal = await xvs.balanceOf(XVS_STORE);
      expect(currBal).equals(xvsStoreBalPrev.add(XVS_REWARD_AMOUNT));
    });

    checkRewardsDistributorPool(COMPTROLLER_CORE, 2);
    checkRewardsDistributorPool(COMPTROLLER_CURVE, 2);
    checkRewardsDistributorPool(COMPTROLLER_LST, 2);

    const wethCoreRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VWETH_CORE,
      borrowSpeed: "4166666666666666",
      supplySpeed: "2777777777777777",
      totalRewardsToDistribute: parseUnits("51000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_WETH", wethCoreRewardsDistributorConfig);

    const wbtcRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VWBTC_CORE,
      borrowSpeed: "12500000000000000",
      supplySpeed: "8333333333333333",
      totalRewardsToDistribute: parseUnits("51000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_VWBTC", wbtcRewardsDistributorConfig);

    const usdtRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VUSDT_CORE,
      borrowSpeed: "12500000000000000",
      supplySpeed: "8333333333333333",
      totalRewardsToDistribute: parseUnits("51000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_USDT", usdtRewardsDistributorConfig);

    const usdcRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VUSDC_CORE,
      borrowSpeed: "12500000000000000",
      supplySpeed: "8333333333333333",
      totalRewardsToDistribute: parseUnits("51000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_USDC", usdcRewardsDistributorConfig);

    const vcrvUSDRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_0,
      token: XVS,
      vToken: VCRVUSD_CORE,
      borrowSpeed: "5555555555555555",
      supplySpeed: "3703703703703703",
      totalRewardsToDistribute: parseUnits("51000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_0_CRVUSD", vcrvUSDRewardsDistributorConfig);

    const vcrvUSDCRVRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CORE,
      address: REWARD_DISTRIBUTOR_CORE_1,
      token: CRV,
      vToken: VCRVUSD_CORE,
      borrowSpeed: "115740740740740740",
      supplySpeed: "77160493827160493",
      totalRewardsToDistribute: parseUnits("125000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Core_1", vcrvUSDCRVRewardsDistributorConfig);

    const crvRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CURVE,
      address: REWARD_DISTRIBUTOR_CURVE_0,
      token: XVS,
      vToken: VCRV_CURVE,
      borrowSpeed: "1388888888888888",
      supplySpeed: "925925925925925",
      totalRewardsToDistribute: parseUnits("7500", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Curve_0_CRV", crvRewardsDistributorConfig);

    const crvCurveRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CURVE,
      address: REWARD_DISTRIBUTOR_CURVE_0,
      token: XVS,
      vToken: VCRVUSD_CURVE,
      borrowSpeed: "5555555555555555",
      supplySpeed: "3703703703703703",
      totalRewardsToDistribute: parseUnits("7500", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Curve_0_CRVUSD", crvCurveRewardsDistributorConfig);

    const crvUSDCurveRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_CURVE,
      address: REWARD_DISTRIBUTOR_CURVE_1,
      token: CRV,
      vToken: VCRVUSD_CURVE,
      borrowSpeed: "115740740740740740",
      supplySpeed: "77160493827160493",
      totalRewardsToDistribute: parseUnits("125000", 18),
    };
    checkRewardsDistributor("RewardsDistributor_Curve_1_CRVUSD", crvUSDCurveRewardsDistributorConfig);

    const wstETHXVSRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_LST,
      address: REWARD_DISTRIBUTOR_LST_0,
      token: XVS,
      vToken: VWSTETH_LST,
      borrowSpeed: "0",
      supplySpeed: "22222222222222222",
      totalRewardsToDistribute: parseUnits("69400", 18),
    };
    checkRewardsDistributor("RewardsDistributor_LST_0_WSTETH", wstETHXVSRewardsDistributorConfig);

    const wethLSTRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_LST,
      address: REWARD_DISTRIBUTOR_LST_0,
      token: XVS,
      vToken: VWETH_LST,
      borrowSpeed: "59413580246913580",
      supplySpeed: "25462962962962962",
      totalRewardsToDistribute: parseUnits("69400", 18),
    };
    checkRewardsDistributor("RewardsDistributor_LST_0_WETH", wethLSTRewardsDistributorConfig);

    const wstETHLSTRewardsDistributorConfig: RewardsDistributorConfig = {
      pool: COMPTROLLER_LST,
      address: REWARD_DISTRIBUTOR_LST_1,
      token: WSTETH,
      vToken: VWSTETH_LST,
      borrowSpeed: "0",
      supplySpeed: "71296296296296",
      totalRewardsToDistribute: parseUnits("15.4", 18),
    };
    checkRewardsDistributor("RewardsDistributor_LST_1_WSTETH", wstETHLSTRewardsDistributorConfig);
  });
});
