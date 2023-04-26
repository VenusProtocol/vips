import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip111 } from "../../vips/vip-111";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTRX = "0xC5D3466aA484B040eE977073fcF337f2c00071c1";

forking(27679359, () => {
  let comptroller: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStalePeriodInOracle(COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("collateral factor of TRX (new) equals 47.5%", async () => {
      const collateralFactor = (await comptroller.markets(NEW_VTRX)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.475", 18));
    });

    it("supply cap of TRX (new) equals 11000000", async () => {
      const oldCap = await comptroller.supplyCaps(NEW_VTRX);
      expect(oldCap).to.equal(parseUnits("11000000", 6));
    });

    it("borrow cap of TRX (new) equals 9000000", async () => {
      const oldCap = await comptroller.borrowCaps(NEW_VTRX);
      expect(oldCap).to.equal(parseUnits("9000000", 6));
    });
  });

  testVip("VIP-106 Risk Parameters Update", vip111(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewBorrowCap", "NewSupplyCap", "Failure"],
        [1, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("collateral factor of TRX (new) equals 50%", async () => {
      const collateralFactor = (await comptroller.markets(NEW_VTRX)).collateralFactorMantissa;
      expect(collateralFactor).to.equal(parseUnits("0.5", 18));
    });

    it("supply cap of TRX (new) equals 12000000", async () => {
      const newCap = await comptroller.supplyCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("12000000", 6));
    });

    it("borrow cap of TRX (new) equals 10000000", async () => {
      const newCap = await comptroller.borrowCaps(NEW_VTRX);
      expect(newCap).to.equal(parseUnits("10000000", 6));
    });
  });
});
