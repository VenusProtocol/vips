import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  COMPTROLLER,
  IL_DEFI_COMPTROLLER,
  OLD_TUSD_CF,
  OLD_TWT_SUPPLY,
  OLD_UNI_SUPPLY,
  OLD_WBETH_BORROW,
  TUSD_CF,
  TWT_SUPPLY,
  UNI_SUPPLY,
  WBETH_BORROW,
  vTUSD,
  vTWT,
  vUNI,
  vWBETH,
  vip247,
} from "../../vips/vip-247/bscmainnet";
import COMTROLLER_ABI from "./abi/comptroller.json";

forking(35700072, async () => {
  const provider = ethers.provider;
  let corePoolComptroller: Contract;
  let ilDefiComptroller: Contract;

  before(async () => {
    corePoolComptroller = new ethers.Contract(COMPTROLLER, COMTROLLER_ABI, provider);
    ilDefiComptroller = new ethers.Contract(IL_DEFI_COMPTROLLER, COMTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify UNI supply cap", async () => {
      const uniSupplyCap = await corePoolComptroller.supplyCaps(vUNI);
      expect(uniSupplyCap).equals(OLD_UNI_SUPPLY);
    });

    it("Verify WBETH borrow cap", async () => {
      const wbethBorrowCap = await corePoolComptroller.borrowCaps(vWBETH);
      expect(wbethBorrowCap).equals(OLD_WBETH_BORROW);
    });

    it("Verify TWT supply caps ", async () => {
      const twtSupplyCap = await ilDefiComptroller.supplyCaps(vTWT);
      expect(twtSupplyCap).equals(OLD_TWT_SUPPLY);
    });

    it("Verify TUSD collateral factor ", async () => {
      const market = await corePoolComptroller.markets(vTUSD);
      expect(market.collateralFactorMantissa).equals(OLD_TUSD_CF);
    });
  });

  testVip("VIP-247 Chaos Labs Recommendations", await vip247(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMTROLLER_ABI], ["NewSupplyCap"], [2]);
      await expectEvents(txResponse, [COMTROLLER_ABI], ["NewBorrowCap"], [1]);
      await expectEvents(txResponse, [COMTROLLER_ABI], ["NewCollateralFactor"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify UNI supply cap", async () => {
      const uniSupplyCap = await corePoolComptroller.supplyCaps(vUNI);
      expect(uniSupplyCap).equals(UNI_SUPPLY);
    });

    it("Verify WBETH borrow cap", async () => {
      const wbethBorrowCap = await corePoolComptroller.borrowCaps(vWBETH);
      expect(wbethBorrowCap).equals(WBETH_BORROW);
    });

    it("Verify TWT supply caps ", async () => {
      const twtSupplyCap = await ilDefiComptroller.supplyCaps(vTWT);
      expect(twtSupplyCap).equals(TWT_SUPPLY);
    });

    it("Verify TUSD collateral factor ", async () => {
      const market = await corePoolComptroller.markets(vTUSD);
      expect(market.collateralFactorMantissa).equals(TUSD_CF);
    });
  });
});
