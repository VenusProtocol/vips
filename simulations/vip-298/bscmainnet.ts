import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BORROW_CAP_USDT_GAMEFI,
  COMPTROLLER,
  GAMEFI_COMPTROLLER,
  SUPPLY_CAP_CAKE,
  SUPPLY_CAP_UNI,
  SUPPLY_CAP_USDT_GAMEFI,
  vCAKE,
  vUNI,
  vUSDT_GAMEFI,
  vip298,
} from "../../vips/vip-298/bscmainnet";
import COMPTROLLER_ABI from "./abi/ComptrollerAbi.json";
import IL_COMPTROLLER_ABI from "./abi/ILComprollerAbi.json";

forking(38167059, async () => {
  let comptroller: Contract;
  let ilComptroller: Contract;

  before(async () => {
    comptroller = await ethers.getContractAt(COMPTROLLER_ABI, COMPTROLLER);
    ilComptroller = await ethers.getContractAt(IL_COMPTROLLER_ABI, GAMEFI_COMPTROLLER);
  });

  describe("Pre-VIP behavior", async () => {
    it("IL old borrow cap", async () => {
      const cap = await ilComptroller.borrowCaps(vUSDT_GAMEFI);
      expect(cap).to.equal(parseUnits("1100000", 18));
    });
    it("IL old supply cap", async () => {
      const cap = await ilComptroller.supplyCaps(vUSDT_GAMEFI);
      expect(cap).to.equal(parseUnits("1200000", 18));
    });
    it("old supply cap", async () => {
      let cap = await comptroller.supplyCaps(vUNI);
      expect(cap).to.equal(parseUnits("400000", 18));

      cap = await comptroller.supplyCaps(vCAKE);
      expect(cap).to.equal(parseUnits("21000000", 18));
    });
  });

  testVip("VIP-298 Update Supply and Borrow Cap", await vip298(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [3, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("IL new borrow cap", async () => {
      const cap = await ilComptroller.borrowCaps(vUSDT_GAMEFI);
      expect(cap).to.equal(BORROW_CAP_USDT_GAMEFI);
    });
    it("IL new supply cap", async () => {
      const cap = await ilComptroller.supplyCaps(vUSDT_GAMEFI);
      expect(cap).to.equal(SUPPLY_CAP_USDT_GAMEFI);
    });
    it("new supply cap", async () => {
      let cap = await comptroller.supplyCaps(vUNI);
      expect(cap).to.equal(SUPPLY_CAP_UNI);

      cap = await comptroller.supplyCaps(vCAKE);
      expect(cap).to.equal(SUPPLY_CAP_CAKE);
    });
  });
});
