import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStaleCoreAssets } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { COMPTROLLER, VADA, VFIL, VTUSD, VWBETH, VXRP, vip166 } from "../../vips/vip-166";
import COMPTROLLER_ABI from "./abi/COMPTROLLER_ABI.json";

const CHAINLINKADDRESS = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

forking(31505400, () => {
  let comptroller: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    await setMaxStaleCoreAssets(CHAINLINKADDRESS, TIMELOCK);
  });

  describe("Pre-VIP behaviour", async () => {
    it("collateral factor of XRP equals 60%", async () => {
      const oldCollateralFactor = (await comptroller.markets(VXRP)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("collateral factor of FIL equals 60%", async () => {
      const oldCollateralFactor = (await comptroller.markets(VFIL)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(parseUnits("0.61", 18));
    });

    it("collateral factor of ADA equals 60%", async () => {
      const oldCollateralFactor = (await comptroller.markets(VADA)).collateralFactorMantissa;
      expect(oldCollateralFactor).to.equal(parseUnits("0.60", 18));
    });

    it("Supply cap of TUSD equals 1,500,000", async () => {
      const oldSupplyCap = await comptroller.supplyCaps(VTUSD);
      expect(oldSupplyCap).to.equal(parseUnits("1500000", 18));
    });

    it("Borrow cap of WBETH equals 1,100", async () => {
      const oldBorrowCap = await comptroller.borrowCaps(VWBETH);
      expect(oldBorrowCap).to.equal(parseUnits("1100", 18));
    });
  });

  testVip("VIP-166 Risk Parameters Update", vip166(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI],
        ["NewCollateralFactor", "NewSupplyCap", "NewBorrowCap", "Failure"],
        [3, 1, 1, 0],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("collateral factor of XRP equals 65%", async () => {
      const newCollateralFactor = (await comptroller.markets(VXRP)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.65", 18));
    });

    it("collateral factor of FIL equals 63%", async () => {
      const newCollateralFactor = (await comptroller.markets(VFIL)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.63", 18));
    });

    it("collateral factor of ADA equals 63%", async () => {
      const newCollateralFactor = (await comptroller.markets(VADA)).collateralFactorMantissa;
      expect(newCollateralFactor).to.equal(parseUnits("0.63", 18));
    });

    it("Supply cap of TUSD equals 3,000,000", async () => {
      const newSupplyCap = await comptroller.supplyCaps(VTUSD);
      expect(newSupplyCap).to.equal(parseUnits("3000000", 18));
    });

    it("Borrow cap of WBETH equals 2,200", async () => {
      const newBorrowCap = await comptroller.borrowCaps(VWBETH);
      expect(newBorrowCap).to.equal(parseUnits("2200", 18));
    });
  });
});
