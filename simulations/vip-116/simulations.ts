import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip116 } from "../../vips/vip-116";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";

forking(28080411, () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStalePeriodInOracle(COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("collateral factor of TRX (new) equals 50%", async () => {
      const collateralFactor = (await comptroller.markets(NEW_VTRX)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.50", 18));
    });

    it("collateral factor of SXP  equals 12.5%", async () => {
      const collateralFactor = (await comptroller.markets(VSXP)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.125", 18));
    });

    it("collateral factor of XVS  equals 55%", async () => {
      const collateralFactor = (await comptroller.markets(VXVS)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.55", 18));
    });

    it("supply cap of XVS equals 1000000", async () => {
      const oldCap = await comptroller.supplyCaps(VXVS);
      expect(oldCap).to.equal(parseUnits("1000000", 18));
    });
  });

  testVip("VIP-116 Risk Parameters Update", vip116(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewCollateralFactor", "NewSupplyCap", "Failure"], [3, 1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("collateral factor of TRX (new) equals 52.5%", async () => {
      const collateralFactor = (await comptroller.markets(NEW_VTRX)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.525", 18));
    });

    it("collateral factor of SXP  equals 0%", async () => {
      const collateralFactor = (await comptroller.markets(VSXP)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(0);
    });

    it("collateral factor of XVS  equals 60%", async () => {
      const collateralFactor = (await comptroller.markets(VXVS)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("supply cap of XVS equals 1500000", async () => {
      const newCap = await comptroller.supplyCaps(VXVS);
      expect(newCap).to.equal(parseUnits("1500000", 18));
    });
  });
});
