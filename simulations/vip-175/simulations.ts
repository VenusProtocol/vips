import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { COMPTROLLER, VTUSD, vip175 } from "../../vips/vip-175";
import COMPTROLLER_ABI from "./abi/COMPTROLLER_ABI.json";

forking(31934930, () => {
  let comptroller: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("Supply cap of TUSD equals 3,000,000", async () => {
      const oldSupplyCap = await comptroller.supplyCaps(VTUSD);
      expect(oldSupplyCap).to.equal(parseUnits("3000000", 18));
    });

    it("Borrow cap of TUSD equals 1,200,000", async () => {
      const oldBorrowCap = await comptroller.borrowCaps(VTUSD);
      expect(oldBorrowCap).to.equal(parseUnits("1200000", 18));
    });
  });

  testVip("VIP-175 Risk Parameters Update", vip175(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap", "Failure"], [1, 1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Supply cap of TUSD equals 5,000,000", async () => {
      const newSupplyCap = await comptroller.supplyCaps(VTUSD);
      expect(newSupplyCap).to.equal(parseUnits("5000000", 18));
    });

    it("Borrow cap of TUSD equals 4,000,000", async () => {
      const newBorrowCap = await comptroller.borrowCaps(VTUSD);
      expect(newBorrowCap).to.equal(parseUnits("4000000", 18));
    });
  });
});
