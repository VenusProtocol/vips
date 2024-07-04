import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip } from "../../../../src/vip-framework";
import vip043, {
  COLLATERAL_FACTOR,
  LIQUIDATION_THRESHOLD,
  LST_COMPTROLLER,
  weETH,
  wstETH,
} from "../../../proposals/ethereum/vip-043";
import COMPTROLLER_ABI from "./abi/ILComprollerAbi.json";

forking(20235713, () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, LST_COMPTROLLER);
  });

  describe("Pre-VIP behavior", () => {
    it("old weETH collateral factor and liquidation threshold", async () => {
      const { collateralFactorMantissa, liquidationThresholdMantissa } = await comptroller.markets(weETH);
      expect(collateralFactorMantissa).to.equal(parseUnits("0.90", 18));
      expect(liquidationThresholdMantissa).to.equal(parseUnits("0.93", 18));
    });

    it("old wstETH collateral factor and liquidation threshold", async () => {
      const { collateralFactorMantissa, liquidationThresholdMantissa } = await comptroller.markets(wstETH);
      expect(collateralFactorMantissa).to.equal(parseUnits("0.90", 18));
      expect(liquidationThresholdMantissa).to.equal(parseUnits("0.93", 18));
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(vip043());
    });

    it("new weETH collateral factor and liquidation threshold", async () => {
      const { collateralFactorMantissa, liquidationThresholdMantissa } = await comptroller.markets(weETH);
      expect(collateralFactorMantissa).to.equal(COLLATERAL_FACTOR);
      expect(liquidationThresholdMantissa).to.equal(LIQUIDATION_THRESHOLD);
    });

    it("new wstETH collateral factor and liquidation threshold", async () => {
      const { collateralFactorMantissa, liquidationThresholdMantissa } = await comptroller.markets(wstETH);
      expect(collateralFactorMantissa).to.equal(COLLATERAL_FACTOR);
      expect(liquidationThresholdMantissa).to.equal(LIQUIDATION_THRESHOLD);
    });
  });
});
