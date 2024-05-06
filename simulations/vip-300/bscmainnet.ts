import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { COMPTROLLER, vFDUSD, vFIL, vip300 } from "../../vips/vip-300/bscmainnet";
import COMPTROLLER_ABI from "./abi/ComptrollerAbi.json";

forking(38340754, () => {
  let comptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("old borrow cap", async () => {
      const cap = await comptroller.borrowCaps(vFDUSD);
      expect(cap).to.equal(parseUnits("24000000", 18));
    });
    it("old supply cap", async () => {
      let cap = await comptroller.supplyCaps(vFDUSD);
      expect(cap).to.equal(parseUnits("30000000", 18));

      cap = await comptroller.supplyCaps(vFIL);
      expect(cap).to.equal(parseUnits("908500", 18));
    });
  });

  testVip("VIP-300 Update Supply and Borrow Cap", vip300(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [2, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("new borrow cap", async () => {
      const cap = await comptroller.borrowCaps(vFDUSD);
      expect(cap).to.equal(parseUnits("34000000", 18));
    });

    it("new supply cap", async () => {
      let cap = await comptroller.supplyCaps(vFDUSD);
      expect(cap).to.equal(parseUnits("40000000", 18));

      cap = await comptroller.supplyCaps(vFIL);
      expect(cap).to.equal(parseUnits("1200000", 18));
    });
  });
});
