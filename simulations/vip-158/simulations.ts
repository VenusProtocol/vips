import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { COMPTROLLER, NEW_BORROW_CAP, NEW_SUPPLY_CAP, VTUSD, vip158 } from "../../vips/vip-158";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(30843050, () => {
  let comptroller: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  testVip("VIP-158 Risk Parameters Update", vip158(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("correct VTUSD supply cap of 1,500,000", async () => {
      expect(await comptroller.supplyCaps(VTUSD)).to.equal(NEW_SUPPLY_CAP);
    });
    it("correct VTUSD borrow cap of 1,200,000", async () => {
      expect(await comptroller.borrowCaps(VTUSD)).to.equal(NEW_BORROW_CAP);
    });
  });
});
