import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  CORE_POOL_COMPTROLLER,
  LIQUID_STAKED_BNB_COMPTROLLER,
  MATIC_NEW_BORROW_CAP,
  MATIC_NEW_SUPPLY_CAP,
  SNBNB_NEW_BORROW_CAP,
  SNBNB_NEW_SUPPLY_CAP,
  VMATIC,
  VSNBNB,
  vip180,
} from "../../vips/vip-180";
import COMPTROLLER_ABI from "./abi/COMPTROLLER_ABI.json";

forking(32305000, () => {
  let coreComptroller: Contract;
  let liquidStakeBnbComptroller: Contract;

  const provider = ethers.provider;

  before(async () => {
    coreComptroller = await new ethers.Contract(CORE_POOL_COMPTROLLER, COMPTROLLER_ABI, provider);
    liquidStakeBnbComptroller = await new ethers.Contract(LIQUID_STAKED_BNB_COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("Supply cap of MATIC equals 6,718,000", async () => {
      const oldSupplyCap = await coreComptroller.supplyCaps(VMATIC);
      expect(oldSupplyCap).to.equal(parseUnits("6718000", 18));
    });

    it("Borrow cap of MATIC equals 1,470,000", async () => {
      const oldBorrowCap = await coreComptroller.borrowCaps(VMATIC);
      expect(oldBorrowCap).to.equal(parseUnits("1470000", 18));
    });

    it("Supply cap of snBNB equals 1000", async () => {
      const oldSupplyCap = await liquidStakeBnbComptroller.supplyCaps(VSNBNB);
      expect(oldSupplyCap).to.equal(parseUnits("1000", 18));
    });

    it("Borrow cap of snBNB equals 100", async () => {
      const oldBorrowCap = await liquidStakeBnbComptroller.borrowCaps(VSNBNB);
      expect(oldBorrowCap).to.equal(parseUnits("100", 18));
    });
  });

  testVip("VIP-180 Risk Parameters Update", vip180(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap", "Failure"], [2, 2, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Supply cap of MATIC equals 8,000,000", async () => {
      const newSupplyCap = await coreComptroller.supplyCaps(VMATIC);
      expect(newSupplyCap).to.equal(MATIC_NEW_SUPPLY_CAP);
    });

    it("Borrow cap of MATIC equals 3,000,000", async () => {
      const newBorrowCap = await coreComptroller.borrowCaps(VMATIC);
      expect(newBorrowCap).to.equal(MATIC_NEW_BORROW_CAP);
    });

    it("Supply cap of snBNB equals 2,000", async () => {
      const newSupplyCap = await liquidStakeBnbComptroller.supplyCaps(VSNBNB);
      expect(newSupplyCap).to.equal(SNBNB_NEW_SUPPLY_CAP);
    });

    it("Borrow cap of snBNB equals 400", async () => {
      const newBorrowCap = await liquidStakeBnbComptroller.borrowCaps(VSNBNB);
      expect(newBorrowCap).to.equal(SNBNB_NEW_BORROW_CAP);
    });
  });
});
