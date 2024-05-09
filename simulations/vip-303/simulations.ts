import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip303, {
  CORE_COMPTROLLER,
  CORE_VFDUSD,
  CORE_VFDUSD_BORROW_CAP,
  CORE_VFDUSD_SUPPLY_CAP,
  CORE_VXVS,
  CORE_VXVS_SUPPLY_CAP,
  GAME_FI_COMPTROLLER,
  GAME_FI_VUSDT,
  GAME_FI_VUSDT_BORROW_CAP,
  GAME_FI_VUSDT_SUPPLY_CAP,
} from "../../vips/vip-303/bscmainnet";
import COMPROLLER_ABI from "./abi/Comptroller.json";

forking(38567077, () => {
  const provider = ethers.provider;
  let coreComptroller: Contract;
  let gameFiComptroller: Contract;

  before(async () => {
    coreComptroller = new ethers.Contract(CORE_COMPTROLLER, COMPROLLER_ABI, provider);
    gameFiComptroller = new ethers.Contract(GAME_FI_COMPTROLLER, COMPROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("has correct supply caps", async () => {
      const vusdtSupplyCap = await gameFiComptroller.supplyCaps(GAME_FI_VUSDT);
      expect(vusdtSupplyCap).to.equal(parseUnits("2000000", 18));

      const vxvsSupplyCap = await coreComptroller.supplyCaps(CORE_VXVS);
      expect(vxvsSupplyCap).to.equal(parseUnits("1750000", 18));

      const vfdusdSupplyCap = await coreComptroller.supplyCaps(CORE_VFDUSD);
      expect(vfdusdSupplyCap).to.equal(parseUnits("40000000", 18));
    });

    it("has correct borrow caps", async () => {
      const vusdtBorrowCap = await gameFiComptroller.borrowCaps(GAME_FI_VUSDT);
      expect(vusdtBorrowCap).to.equal(parseUnits("1900000", 18));

      const vfdusdBorrowCap = await coreComptroller.borrowCaps(CORE_VFDUSD);
      expect(vfdusdBorrowCap).to.equal(parseUnits("34000000", 18));
    });
  });

  testVip("Update Caps", vip303(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [COMPROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [3, 2]);
    },
  });

  describe("Post-VIP state", () => {
    it("has correct supply caps", async () => {
      const vusdtSupplyCap = await gameFiComptroller.supplyCaps(GAME_FI_VUSDT);
      expect(vusdtSupplyCap).to.equal(GAME_FI_VUSDT_SUPPLY_CAP);

      const vxvsSupplyCap = await coreComptroller.supplyCaps(CORE_VXVS);
      expect(vxvsSupplyCap).to.equal(CORE_VXVS_SUPPLY_CAP);

      const vfdusdSupplyCap = await coreComptroller.supplyCaps(CORE_VFDUSD);
      expect(vfdusdSupplyCap).to.equal(CORE_VFDUSD_SUPPLY_CAP);
    });

    it("has correct borrow caps", async () => {
      const vusdtBorrowCap = await gameFiComptroller.borrowCaps(GAME_FI_VUSDT);
      expect(vusdtBorrowCap).to.equal(GAME_FI_VUSDT_BORROW_CAP);

      const vfdusdBorrowCap = await coreComptroller.borrowCaps(CORE_VFDUSD);
      expect(vfdusdBorrowCap).to.equal(CORE_VFDUSD_BORROW_CAP);
    });
  });
});
