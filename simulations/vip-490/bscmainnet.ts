import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip490, {
  CORE_COMPTROLLER,
  DEFI_COMPTROLLER_ADDRESS,
  DEFI_VALPACA,
  DEFI_VALPACA_SUPPLY_CAP,
  VSUSDE,
  VSUSDE_SUPPLY_CAP,
  VUSDC,
  VUSDC_BORROW_CAP,
  VUSDC_SUPPLY_CAP,
} from "../../vips/vip-490/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";
import IL_COMPTROLLER_ABI from "./abi/ilComptroller.json";

forking(48764090, async () => {
  const coreComptroller = new ethers.Contract(CORE_COMPTROLLER, CORE_COMPTROLLER_ABI, ethers.provider);
  const deFiComptroller = new ethers.Contract(DEFI_COMPTROLLER_ADDRESS, IL_COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP risk parameters", () => {
    it("USDC should have supply cap of 258M", async () => {
      const supplyCap = await coreComptroller.supplyCaps(VUSDC);
      expect(supplyCap).equals(parseUnits("258000000", 18));
    });

    it(`USDC should have borrow cap of 200M`, async () => {
      const borrowCap = await coreComptroller.borrowCaps(VUSDC);
      expect(borrowCap).equals(parseUnits("200000000", 18));
    });

    it(`sUSDe should have supply cap of 2M`, async () => {
      const supplyCap = await coreComptroller.supplyCaps(VSUSDE);
      expect(supplyCap).equals(parseUnits("2000000", 18));
    });

    it(`ALPACA should have supply cap of 1.5M`, async () => {
      const supplyCap = await deFiComptroller.supplyCaps(DEFI_VALPACA);
      expect(supplyCap).equals(parseUnits("1500000", 18));
    });
  });

  testVip("VIP-490", await vip490(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [3, 1]);
    },
  });

  describe("Risk parameters", () => {
    it(`USDC should have supply cap of ${VUSDC_SUPPLY_CAP}`, async () => {
      const supplyCap = await coreComptroller.supplyCaps(VUSDC);
      expect(supplyCap).equals(VUSDC_SUPPLY_CAP);
    });

    it(`USDC should have borrow cap of ${VUSDC_BORROW_CAP}`, async () => {
      const borrowCap = await coreComptroller.borrowCaps(VUSDC);
      expect(borrowCap).equals(VUSDC_BORROW_CAP);
    });

    it(`sUSDe should have supply cap of ${VSUSDE_SUPPLY_CAP}`, async () => {
      const supplyCap = await coreComptroller.supplyCaps(VSUSDE);
      expect(supplyCap).equals(VSUSDE_SUPPLY_CAP);
    });

    it(`ALPACA should have supply cap of ${DEFI_VALPACA_SUPPLY_CAP}`, async () => {
      const supplyCap = await deFiComptroller.supplyCaps(DEFI_VALPACA);
      expect(supplyCap).equals(DEFI_VALPACA_SUPPLY_CAP);
    });
  });
});
