import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { CORE_COMPTROLLER, vSOLVBTC_CORE, vSOLVBTC_CORE_SUPPLY_CAP, vip441 } from "../../vips/vip-441/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/CoreComptroller.json";

const vSOLVBTC_CORE_SUPPLY_CAP_PREV = parseUnits("400", 18);

forking(46302142, async () => {
  const provider = ethers.provider;
  const coreComptroller = new ethers.Contract(CORE_COMPTROLLER, CORE_COMPTROLLER_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    describe("CORE pool checks", () => {
      it("check supply cap for SOLVBTC", async () => {
        const supplyCap = await coreComptroller.supplyCaps(vSOLVBTC_CORE);

        expect(supplyCap).to.eq(vSOLVBTC_CORE_SUPPLY_CAP_PREV);
      });
    });
  });

  testVip("VIP-441", await vip441(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    describe("CORE pool checks", () => {
      it("check supply cap for SOLVBTC", async () => {
        const supplyCap = await coreComptroller.supplyCaps(vSOLVBTC_CORE);

        expect(supplyCap).to.eq(vSOLVBTC_CORE_SUPPLY_CAP);
      });
    });
  });
});
