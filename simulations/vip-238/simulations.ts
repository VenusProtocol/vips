import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { COMPTROLLER, caps, vip238 } from "../../vips/vip-238";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import SETTER_FACET_ABI from "./abi/SetterFacet.json";

forking(35215431, () => {
  let comptroller: ethers.Contract;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, ethers.provider);
  });

  testVip("VIP-238", vip238(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [SETTER_FACET_ABI], ["NewBorrowCap"], [13]);
      await expectEvents(txResponse, [SETTER_FACET_ABI], ["NewSupplyCap"], [11]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check supply and borrow caps", async () => {
      for (const cap of caps) {
        const supplyCap = await comptroller.supplyCaps(cap.vToken);
        const borrowCap = await comptroller.borrowCaps(cap.vToken);

        if (cap.supplyCap) expect(supplyCap).to.equal(parseUnits(cap.supplyCap, cap.decimals));
        if (cap.borrowCap) expect(borrowCap).to.equal(parseUnits(cap.borrowCap, cap.decimals));
      }
    });
  });
});