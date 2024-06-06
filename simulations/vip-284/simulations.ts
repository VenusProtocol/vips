import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip284, {
  COMPTROLLER,
  FDUSD_BORROW_CAP,
  OLD_FDUSD_BORROW_CAP,
  OLD_USDT_BORROW_CAP,
  OLD_USDT_SUPPLY_CAP,
  OLD_WBETH_BORROW_CAP,
  USDT_BORROW_CAP,
  USDT_SUPPLY_CAP,
  WBETH_BORROW_CAP,
  vFDUSD,
  vUSDT,
  vWBETH,
} from "../../vips/vip-284/bscmainnet";
import COMTROLLER_ABI from "./abi/comptroller.json";

forking(37530700, async () => {
  const provider = ethers.provider;
  let corePoolComptroller: Contract;

  before(async () => {
    corePoolComptroller = new ethers.Contract(COMPTROLLER, COMTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify FDUSD borrow cap", async () => {
      const fdusdSupplyCap = await corePoolComptroller.borrowCaps(vFDUSD);
      expect(fdusdSupplyCap).equals(OLD_FDUSD_BORROW_CAP);
    });
    it("Verify USDT supply cap", async () => {
      const usdtSupplyCap = await corePoolComptroller.supplyCaps(vUSDT);
      expect(usdtSupplyCap).equals(OLD_USDT_SUPPLY_CAP);
    });
    it("Verify USDT borrow cap", async () => {
      const usdtBorrowCap = await corePoolComptroller.borrowCaps(vUSDT);
      expect(usdtBorrowCap).equals(OLD_USDT_BORROW_CAP);
    });
    it("Verify WBETH borrow cap", async () => {
      const wbethBorrowCap = await corePoolComptroller.borrowCaps(vWBETH);
      expect(wbethBorrowCap).equals(OLD_WBETH_BORROW_CAP);
    });
  });

  testVip("VIP-284 Chaos Labs Recommendations", await vip284(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [1, 3]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify FDUSD borrow cap", async () => {
      const fdusdBorrowCap = await corePoolComptroller.borrowCaps(vFDUSD);
      expect(fdusdBorrowCap).equals(FDUSD_BORROW_CAP);
    });
    it("Verify USDT supply cap", async () => {
      const usdtSupplyCap = await corePoolComptroller.supplyCaps(vUSDT);
      expect(usdtSupplyCap).equals(USDT_SUPPLY_CAP);
    });
    it("Verify USDT borrow cap", async () => {
      const usdtBorrowCap = await corePoolComptroller.borrowCaps(vUSDT);
      expect(usdtBorrowCap).equals(USDT_BORROW_CAP);
    });
    it("Verify WBETH borrow cap", async () => {
      const wbethBorrowCap = await corePoolComptroller.borrowCaps(vWBETH);
      expect(wbethBorrowCap).equals(WBETH_BORROW_CAP);
    });
  });
});
