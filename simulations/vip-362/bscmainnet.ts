import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip362, {
  GAMEFI_COMPTROLLER,
  UNITROLLER,
  vDOGE,
  vDOGE_SUPPLY_CAP,
  vFLOKI,
  vFLOKI_BORROW_CAP,
  vUNI,
  vUNI_SUPPLY_CAP,
} from "../../vips/vip-362/bscmainnet";
import CORE_COMPTROLLER_ABI from "./abi/comptroller.json";
import IL_COMPTROLLER_ABI from "./abi/comptroller.json";

forking(41983388, async () => {
  const provider = ethers.provider;
  let comptrollerContract: Contract;
  let gameFiComptrollerContract: Contract;

  before(async () => {
    comptrollerContract = new ethers.Contract(UNITROLLER, CORE_COMPTROLLER_ABI, provider);
    gameFiComptrollerContract = new ethers.Contract(GAMEFI_COMPTROLLER, IL_COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check supply cap", async () => {
      const UNI_supplyCap = await comptrollerContract.supplyCaps(vUNI);
      expect(UNI_supplyCap).to.be.equal(parseUnits("600000", 18));

      const DOGE_supplyCap = await comptrollerContract.supplyCaps(vDOGE);
      expect(DOGE_supplyCap).to.be.equal(parseUnits("80000000", 8));

      const FLOKI_borrowCap = await gameFiComptrollerContract.borrowCaps(vFLOKI);
      expect(FLOKI_borrowCap).to.be.equal(parseUnits("2000000000", 9));
    });
  });

  testVip("VIP-362", await vip362(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [2]);
      await expectEvents(txResponse, [IL_COMPTROLLER_ABI], ["NewBorrowCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check new caps", async () => {
      const UNI_supplyCap = await comptrollerContract.supplyCaps(vUNI);
      expect(UNI_supplyCap).to.be.equal(vUNI_SUPPLY_CAP);

      const DOGE_supplyCap = await comptrollerContract.supplyCaps(vDOGE);
      expect(DOGE_supplyCap).to.be.equal(vDOGE_SUPPLY_CAP);

      const FLOKI_borrowCap = await gameFiComptrollerContract.borrowCaps(vFLOKI);
      expect(FLOKI_borrowCap).to.be.equal(vFLOKI_BORROW_CAP);
    });
  });
});
