import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import {
  ZK_COMPTROLLER,
  vUSDC,
  vUSDC_COLLATERAL_FACTOR,
  vUSDC_E,
  vUSDC_LIQUIDATION_THRESHOLD,
  vip423,
} from "../../vips/vip-423/bscmainnet";
import IL_COMPTROLLER_ABI from "./abi/ILComptroller.json";

const vUSDC_COLLATERAL_FACTOR_PREV = parseUnits("0.72", 18);
const vUSDC_LIQUIDATION_THRESHOLD_PREV = parseUnits("0.75", 18);

forking(53573122, async () => {
  const provider = ethers.provider;
  const comptroller = new ethers.Contract(ZK_COMPTROLLER, IL_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("collateral factor and liquidation threshold for USDC.e", async () => {
      const market = await comptroller.markets(vUSDC_E);
      expect(market.collateralFactorMantissa).to.eq(vUSDC_COLLATERAL_FACTOR_PREV);
      expect(market.liquidationThresholdMantissa).to.eq(vUSDC_LIQUIDATION_THRESHOLD_PREV);
    });

    it("collateral factor and liquidation threshold for USDC", async () => {
      const market = await comptroller.markets(vUSDC);
      expect(market.collateralFactorMantissa).to.eq(vUSDC_COLLATERAL_FACTOR_PREV);
      expect(market.liquidationThresholdMantissa).to.eq(vUSDC_LIQUIDATION_THRESHOLD_PREV);
    });
  });

  testForkedNetworkVipCommands("VIP 423", await vip423(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [IL_COMPTROLLER_ABI], ["NewCollateralFactor", "NewLiquidationThreshold"], [2, 2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("collateral factor and liquidation threshold for USDC.e", async () => {
      const market = await comptroller.markets(vUSDC_E);
      expect(market.collateralFactorMantissa).to.eq(vUSDC_COLLATERAL_FACTOR);
      expect(market.liquidationThresholdMantissa).to.eq(vUSDC_LIQUIDATION_THRESHOLD);
    });

    it("collateral factor and liquidation threshold for USDC", async () => {
      const market = await comptroller.markets(vUSDC);
      expect(market.collateralFactorMantissa).to.eq(vUSDC_COLLATERAL_FACTOR);
      expect(market.liquidationThresholdMantissa).to.eq(vUSDC_LIQUIDATION_THRESHOLD);
    });
  });
});
