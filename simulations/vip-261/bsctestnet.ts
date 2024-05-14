import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { COMPTROLLER, NEW_BORROW_CAP, OLD_BORROW_CAP, WBETH_VTOKEN, vip261 } from "../../vips/vip-261/bsctestnet";
import { abi as DIAMOND_CONSOLIDATED_ABI } from "./abi/DiamondConsolidated.json";

forking(37940238, () => {
  const provider = ethers.provider;
  let comptroller: Contract;
  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, DIAMOND_CONSOLIDATED_ABI, provider);
  });
  describe("Pre-VIP behavior", () => {
    it("Verify current borrow cap is 200", async () => {
      const currentWBethBorrowCap = await comptroller.borrowCaps(WBETH_VTOKEN);
      expect(currentWBethBorrowCap).equals(OLD_BORROW_CAP);
    });
  });

  describe("Post-VIP behavior", () => {
    it("Verify current borrow cap is 200", async () => {
      const currentWBethBorrowCap = await comptroller.borrowCaps(WBETH_VTOKEN);
      expect(currentWBethBorrowCap).equals(OLD_BORROW_CAP);
    });
    it("Verify current borrow cap is 4000", async () => {
      await pretendExecutingVip(await vip261());
      const currentWBethBorrowCap = await comptroller.borrowCaps(WBETH_VTOKEN);
      expect(currentWBethBorrowCap).equals(NEW_BORROW_CAP);
    });
  });
});

forking(37940238, async () => {
  const provider = ethers.provider;
  let comptroller: Contract;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, DIAMOND_CONSOLIDATED_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify current borrow cap is 200", async () => {
      const currentWBethBorrowCap = await comptroller.borrowCaps(WBETH_VTOKEN);
      expect(currentWBethBorrowCap).equals(OLD_BORROW_CAP);
    });
  });

  testVip("VIP-261 Set new WBETH borrow cap to 4000", await vip261(), {
    supporter: "0x55a9f5374af30e3045fb491f1da3c2e8a74d168d",
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [DIAMOND_CONSOLIDATED_ABI], ["NewBorrowCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify current borrow cap is 4000", async () => {
      const currentBaseRate = await comptroller.borrowCaps(WBETH_VTOKEN);
      expect(currentBaseRate).equals(NEW_BORROW_CAP);
    });
  });
});
