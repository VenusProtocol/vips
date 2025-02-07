import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  COMPTROLLER,
  USDC_E_SUPPLY_CAP,
  VUSDC_E_CORE,
  VZK_CORE,
  VZK_CORE_COLLATERAL_FACTOR,
  VZK_CORE_LIQUIDATION_THRESHOLD,
  ZK_SUPPLY_CAP,
  vip418,
} from "../../vips/vip-418/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const USDC_E_SUPPLY_CAP_PREV = parseUnits("12000000", 6);
const ZK_SUPPLY_CAP_PREV = parseUnits("100000000", 18);
const VZK_CORE_COLLATERAL_FACTOR_PREV = parseUnits("0.35", 18);
const VZK_CORE_LIQUIDATION_THRESHOLD_PREV = parseUnits("0.4", 18);

forking(53008644, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check supply cap for ZK", async () => {
      const supplyCap = await comptroller.supplyCaps(VZK_CORE);

      expect(supplyCap).to.eq(ZK_SUPPLY_CAP_PREV);
    });

    it("collateral factor and liquidation threshold for ZK", async () => {
      const zkMarket = await comptroller.markets(VZK_CORE);
      expect(zkMarket.collateralFactorMantissa).to.eq(VZK_CORE_COLLATERAL_FACTOR_PREV);
      expect(zkMarket.liquidationThresholdMantissa).to.eq(VZK_CORE_LIQUIDATION_THRESHOLD_PREV);
    });

    it("check supply cap for USDC.e", async () => {
      const supplyCap = await comptroller.supplyCaps(VUSDC_E_CORE);

      expect(supplyCap).to.eq(USDC_E_SUPPLY_CAP_PREV);
    });
  });

  testForkedNetworkVipCommands("VIP 418", await vip418(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewSupplyCap", "NewCollateralFactor", "NewLiquidationThreshold"],
        [2, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply cap for ZK", async () => {
      const supplyCap = await comptroller.supplyCaps(VZK_CORE);

      expect(supplyCap).to.eq(ZK_SUPPLY_CAP);
    });

    it("collateral factor and liquidation threshold for ZK", async () => {
      const zkMarket = await comptroller.markets(VZK_CORE);
      expect(zkMarket.collateralFactorMantissa).to.eq(VZK_CORE_COLLATERAL_FACTOR);
      expect(zkMarket.liquidationThresholdMantissa).to.eq(VZK_CORE_LIQUIDATION_THRESHOLD);
    });

    it("check supply cap for USDC.e", async () => {
      const supplyCap = await comptroller.supplyCaps(VUSDC_E_CORE);

      expect(supplyCap).to.eq(USDC_E_SUPPLY_CAP);
    });
  });
});
