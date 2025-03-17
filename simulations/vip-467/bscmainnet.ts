import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip467, { BNB_CORE_COMPTROLLER, BNB_UNI_CORE, BNB_UNI_CORE_SUPPLY_CAP } from "../../vips/vip-467/bscmainnet";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(47548587, async () => {
  const comptroller = new ethers.Contract(BNB_CORE_COMPTROLLER, COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP risk parameters", () => {
    it("UNI should have supply cap of 1.56M", async () => {
      const supplyCap = await comptroller.supplyCaps(BNB_UNI_CORE);
      expect(supplyCap).equals(parseUnits("1560000", 18));
    });
  });

  testVip("VIP-467", await vip467(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap"], [1, 0]);
    },
  });

  describe("Risk parameters", () => {
    it(`UNI should have supply cap of ${BNB_UNI_CORE_SUPPLY_CAP}`, async () => {
      const supplyCap = await comptroller.supplyCaps(BNB_UNI_CORE);
      expect(supplyCap).equals(BNB_UNI_CORE_SUPPLY_CAP);
    });
  });
});
