import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vip101 } from "../../vips/vip-101";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";
const OLD_VTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const VETH = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";

forking(26107552, () => {
  let comptroller: ethers.Contract;
  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("PRE-VIP behavior", async () => {
    it("collateral factor of SXP equals 35%", async () => {
      const newCollateralFactor = (await comptroller.markets(VSXP)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.35", 18));
    });

    it("collateral factor of TRXOLD equals 60%", async () => {
      const newCollateralFactor = (await comptroller.markets(OLD_VTRX)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.6", 18));
    });

    it("collateral factor of TRX (new) equals 0%", async () => {
      const newCollateralFactor = (await comptroller.markets(NEW_VTRX)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(0);
    });

    it("supply cap of TRX (new) equals 180,000", async () => {
      const newCap = await comptroller.supplyCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("180000", 6));
    });

    it("borrow cap of TRX (new) equals 100,000", async () => {
      const newCap = await comptroller.borrowCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("100000", 6));
    });

    it("borrow cap of ETH equals 28,740", async () => {
      const newCap = await comptroller.borrowCaps(VETH);
      expect(newCap).to.equal(parseUnits("28740", 18));
    });
  });
});

forking(26107552, () => {
  testVip("VIP-101 Venus Recommend Parameters", vip101());
});

forking(26107552, () => {
  let comptroller: ethers.Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await pretendExecutingVip(vip101());
  });

  describe("Post-VIP behavior", async () => {
    it("sets the collateral factor to 30% SXP", async () => {
      const newCollateralFactor = (await comptroller.markets(VSXP)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.3", 18));
    });

    it("sets the collateral factor to 50% TRXOLD", async () => {
      const newCollateralFactor = (await comptroller.markets(OLD_VTRX)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.5", 18));
    });

    it("sets the collateral factor to 10% TRX", async () => {
      const newCollateralFactor = (await comptroller.markets(NEW_VTRX)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.1", 18));
    });

    it("sets the supply cap to 300,000 TRX", async () => {
      const newCap = await comptroller.supplyCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("300000", 6));
    });

    it("sets the borrow cap to 200,000 TRX", async () => {
      const newCap = await comptroller.borrowCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("200000", 6));
    });

    it("sets the borrow cap to 40,000 ETH", async () => {
      const newCap = await comptroller.borrowCaps(VETH);
      expect(newCap).to.equal(parseUnits("40000", 18));
    });
  });
});
