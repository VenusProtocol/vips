import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CORE_COMPTROLLER,
  DEFI_COMPTROLLER,
  vAAVE_CORE,
  vAAVE_CORE_BORROW_CAP,
  vLTC_CORE,
  vLTC_CORE_BORROW_CAP,
  vLTC_CORE_SUPPLY_CAP,
  vTWT_DEFI,
  vTWT_DEFI_COLLATERAL_FACTOR,
  vTWT_DEFI_SUPPLY_CAP,
  vip388,
} from "../../vips/vip-388/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";
import DEFI_COMPTROLLER_ABI from "./abi/CoreComptroller.json";

const vAAVE_CORE_SUPPLY_CAP = parseUnits("20000", 18);
const vLTC_CORE_SUPPLY_CAP_PREV = parseUnits("120000", 18);
const vLTC_CORE_BORROW_CAP_PREV = parseUnits("10000", 18);
const vAAVE_CORE_BORROW_CAP_PREV = parseUnits("2000", 18);
const vTWT_DEFI_COLLATERAL_FACTOR_PREV = parseUnits("0.5", 18);
const vTWT_DEFI_SUPPLY_CAP_PREV = parseUnits("3000000", 18);
const vTWT_DEFI_LIQUIDATION_THRESHOLD = parseUnits("0.6", 18);
const vTWT_DEFI_BORROW_CAP = parseUnits("100000", 18);

forking(43422150, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(CORE_COMPTROLLER, CORE_COMPTROLLER_ABI, provider);
  const defiComptroller = new ethers.Contract(DEFI_COMPTROLLER, DEFI_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    describe("CORE pool checks", () => {
      it("check supply and borrow cap for LTC", async () => {
        const supplyCap = await coreComptroller.supplyCaps(vLTC_CORE);
        const borrowCap = await coreComptroller.borrowCaps(vLTC_CORE);

        expect(supplyCap).to.eq(vLTC_CORE_SUPPLY_CAP_PREV);
        expect(borrowCap).to.eq(vLTC_CORE_BORROW_CAP_PREV);
      });

      it("check supply and borrow cap for AAVE", async () => {
        const supplyCap = await coreComptroller.supplyCaps(vAAVE_CORE);
        const borrowCap = await coreComptroller.borrowCaps(vAAVE_CORE);

        expect(supplyCap).to.eq(vAAVE_CORE_SUPPLY_CAP);
        expect(borrowCap).to.eq(vAAVE_CORE_BORROW_CAP_PREV);
      });
    });

    describe("DEFI pool", () => {
      it("check supply and borrow cap for TWT", async () => {
        const supplyCap = await defiComptroller.supplyCaps(vTWT_DEFI);
        const borrowCap = await defiComptroller.borrowCaps(vTWT_DEFI);

        expect(supplyCap).to.eq(vTWT_DEFI_SUPPLY_CAP_PREV);
        expect(borrowCap).to.eq(vTWT_DEFI_BORROW_CAP);
      });

      it("Collateral factor and liquidation threshold for TWT", async () => {
        const twtMarket = await defiComptroller.markets(vTWT_DEFI);
        expect(twtMarket.collateralFactorMantissa).to.eq(vTWT_DEFI_COLLATERAL_FACTOR_PREV);
        expect(twtMarket.liquidationThresholdMantissa).to.eq(vTWT_DEFI_LIQUIDATION_THRESHOLD);
      });
    });
  });

  testVip("VIP-388", await vip388(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewBorrowCap", "NewSupplyCap"], [2, 2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("CORE pool checks", () => {
      it("check supply and borrow cap for LTC", async () => {
        const supplyCap = await coreComptroller.supplyCaps(vLTC_CORE);
        const borrowCap = await coreComptroller.borrowCaps(vLTC_CORE);

        expect(supplyCap).to.eq(vLTC_CORE_SUPPLY_CAP);
        expect(borrowCap).to.eq(vLTC_CORE_BORROW_CAP);
      });

      it("check supply and borrow cap for AAVE", async () => {
        const supplyCap = await coreComptroller.supplyCaps(vAAVE_CORE);
        const borrowCap = await coreComptroller.borrowCaps(vAAVE_CORE);

        expect(supplyCap).to.eq(vAAVE_CORE_SUPPLY_CAP);
        expect(borrowCap).to.eq(vAAVE_CORE_BORROW_CAP);
      });
    });

    describe("DEFI pool", () => {
      it("check supply and borrow cap for TWT", async () => {
        const supplyCap = await defiComptroller.supplyCaps(vTWT_DEFI);
        const borrowCap = await defiComptroller.borrowCaps(vTWT_DEFI);

        expect(supplyCap).to.eq(vTWT_DEFI_SUPPLY_CAP);
        expect(borrowCap).to.eq(vTWT_DEFI_BORROW_CAP);
      });

      it("Collateral factor and liquidation threshold for TWT", async () => {
        const twtMarket = await defiComptroller.markets(vTWT_DEFI);
        expect(twtMarket.collateralFactorMantissa).to.eq(vTWT_DEFI_COLLATERAL_FACTOR);
        expect(twtMarket.liquidationThresholdMantissa).to.eq(vTWT_DEFI_LIQUIDATION_THRESHOLD);
      });
    });
  });
});
