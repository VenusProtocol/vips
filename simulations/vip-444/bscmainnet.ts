import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CORE_COMPTROLLER,
  vTHE_CORE,
  vTHE_CORE_BORROW_CAP,
  vTHE_CORE_SUPPLY_CAP,
  vip444,
} from "../../vips/vip-444/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";

const vTHE_CORE_SUPPLY_CAP_PREV = parseUnits("2400000", 18);
const vTHE_CORE_BORROW_CAP_PREV = parseUnits("1200000", 18);

forking(46404873, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(CORE_COMPTROLLER, CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    describe("CORE pool checks", () => {
      it("check supply cap for THE", async () => {
        const supplyCap = await coreComptroller.supplyCaps(vTHE_CORE);

        expect(supplyCap).to.eq(vTHE_CORE_SUPPLY_CAP_PREV);
      });
      it("check borrow cap for THE", async () => {
        const borrowCap = await coreComptroller.borrowCaps(vTHE_CORE);

        expect(borrowCap).to.eq(vTHE_CORE_BORROW_CAP_PREV);
      });
    });
  });

  testVip("VIP-444", await vip444(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("CORE pool checks", () => {
      it("check supply cap for THE", async () => {
        const supplyCap = await coreComptroller.supplyCaps(vTHE_CORE);

        expect(supplyCap).to.eq(vTHE_CORE_SUPPLY_CAP);
      });
      it("check borrow cap for THE", async () => {
        const borrowCap = await coreComptroller.borrowCaps(vTHE_CORE);

        expect(borrowCap).to.eq(vTHE_CORE_BORROW_CAP);
      });
    });
  });
});
