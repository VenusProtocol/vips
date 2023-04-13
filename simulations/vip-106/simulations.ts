import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip106 } from "../../vips/vip-106";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const OLD_VTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";

forking(27276233, () => {
  let comptroller: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStalePeriodInOracle(COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("collateral factor of TRX (old) equals 20%", async () => {
      const collateralFactor = (await comptroller.markets(OLD_VTRX)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.2", 18));
    });

    it("collateral factor of TRX (new) equals 45%", async () => {
      const collateralFactor = (await comptroller.markets(NEW_VTRX)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.45", 18));
    });

    it("supply cap of TRX (new) equals 10000000", async () => {
      const oldCap = await comptroller.supplyCaps(NEW_VTRX);
      expect(oldCap).to.equal(parseUnits("10000000", 6));
    });

    it("borrow cap of TRX (new) equals 8000000", async () => {
      const oldCap = await comptroller.borrowCaps(NEW_VTRX);
      expect(oldCap).to.equal(parseUnits("8000000", 6));
    });

    it("collateral factor of SXP  equals 17.5%", async () => {
      const collateralFactor = (await comptroller.markets(VSXP)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.175", 18));
    });

    it("collateral factor of XVS  equals 60%", async () => {
      const collateralFactor = (await comptroller.markets(VXVS)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("supply cap of XVS equals 1311000", async () => {
      const oldCap = await comptroller.supplyCaps(VXVS);
      expect(oldCap).to.equal(parseUnits("1311000", 18));
    });
  });

  testVip("VIP-106 Risk Parameters Update", vip106(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewBorrowCap", "NewSupplyCap", "Failure"],
        [4, 1, 2, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("collateral factor of TRX (old) equals 0%", async () => {
      const collateralFactor = (await comptroller.markets(OLD_VTRX)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(0);
    });

    it("collateral factor of TRX (new) equals 47.5%", async () => {
      const collateralFactor = (await comptroller.markets(NEW_VTRX)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.475", 18));
    });

    it("supply cap of TRX (new) equals 11000000", async () => {
      const newCap = await comptroller.supplyCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("11000000", 6));
    });

    it("borrow cap of TRX (new) equals 9000000", async () => {
      const newCap = await comptroller.borrowCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("9000000", 6));
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
      const newCap = await comptroller.supplyCaps(VXVS);
      expect(newCap).to.equal(parseUnits("1000000", 18));
    });
  });
});
