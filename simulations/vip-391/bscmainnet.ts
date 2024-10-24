import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CORE_COMPTROLLER,
  vAAVE,
  vAAVE_BORROW_CAP,
  vLTC,
  vLTC_BORROW_CAP,
  vLTC_SUPPLY_CAP,
  vip391,
} from "../../vips/vip-391/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";

const vAAVE_SUPPLY_CAP = parseUnits("20000", 18);
const vLTC_SUPPLY_CAP_PREV = parseUnits("120000", 18);
const vLTC_BORROW_CAP_PREV = parseUnits("10000", 18);
const vAAVE_BORROW_CAP_PREV = parseUnits("2000", 18);

forking(43368825, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("check supply and borrow cap for LTC", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vLTC);
      const borrowCap = await coreComptroller.borrowCaps(vLTC);

      expect(supplyCap).to.eq(vLTC_SUPPLY_CAP_PREV);
      expect(borrowCap).to.eq(vLTC_BORROW_CAP_PREV);
    });

    it("check supply and borrow cap for AAVE", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vAAVE);
      const borrowCap = await coreComptroller.borrowCaps(vAAVE);

      expect(supplyCap).to.eq(vAAVE_SUPPLY_CAP);
      expect(borrowCap).to.eq(vAAVE_BORROW_CAP_PREV);
    });
  });

  testVip("VIP-391", await vip391(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap", "NewSupplyCap"], [2, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply and borrow cap for LTC", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vLTC);
      const borrowCap = await coreComptroller.borrowCaps(vLTC);

      expect(supplyCap).to.eq(vLTC_SUPPLY_CAP);
      expect(borrowCap).to.eq(vLTC_BORROW_CAP);
    });

    it("check supply and borrow cap for AAVE", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vAAVE);
      const borrowCap = await coreComptroller.borrowCaps(vAAVE);

      expect(supplyCap).to.eq(vAAVE_SUPPLY_CAP);
      expect(borrowCap).to.eq(vAAVE_BORROW_CAP);
    });
  });
});
