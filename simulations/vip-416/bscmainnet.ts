import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  CORE_COMPTROLLER,
  vSOLVBTC_CORE,
  vSOLVBTC_CORE_BORROW_CAP,
  vSOLVBTC_CORE_SUPPLY_CAP,
  vip416,
} from "../../vips/vip-416/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";

const vSOLVBTC_CORE_SUPPLY_CAP_PREV = parseUnits("200", 18);
const vSOLVBTC_CORE_BORROW_CAP_PREV = parseUnits("55", 18);

forking(45356639, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(CORE_COMPTROLLER, CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    describe("CORE pool checks", () => {
      it("check supply cap for SOLVBTC", async () => {
        const supplyCap = await coreComptroller.supplyCaps(vSOLVBTC_CORE);

        expect(supplyCap).to.eq(vSOLVBTC_CORE_SUPPLY_CAP_PREV);
      });

      it("check borrow cap for SOLVBTC", async () => {
        const borrowCap = await coreComptroller.borrowCaps(vSOLVBTC_CORE);

        expect(borrowCap).to.eq(vSOLVBTC_CORE_BORROW_CAP_PREV);
      });
    });
  });

  testVip("VIP-416", await vip416(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("CORE pool checks", () => {
      it("check supply cap for SOLVBTC", async () => {
        const supplyCap = await coreComptroller.supplyCaps(vSOLVBTC_CORE);

        expect(supplyCap).to.eq(vSOLVBTC_CORE_SUPPLY_CAP);
      });

      it("check borrow cap for SOLVBTC", async () => {
        const borrowCap = await coreComptroller.borrowCaps(vSOLVBTC_CORE);

        expect(borrowCap).to.eq(vSOLVBTC_CORE_BORROW_CAP);
      });
    });
  });
});
