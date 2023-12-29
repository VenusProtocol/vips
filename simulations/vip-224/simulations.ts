import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkCorePoolComptroller } from "../../src/vip-framework/checks/checkCorePoolComptroller";
import { vip224 } from "../../vips/vip-224";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const VUNI = "0x27FF564707786720C71A2e5c1490A63266683612";
const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";

forking(34772092, () => {
  let comptroller: ethers.Contract;
  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("supply cap of UNI equals 100K UNI", async () => {
      const newCap = await comptroller.supplyCaps(VUNI);
      expect(newCap).to.equal(parseUnits("100000", 18));
    });

    it("borrow cap of UNI equals 50K UNI", async () => {
      const newCap = await comptroller.borrowCaps(VUNI);
      expect(newCap).to.equal(parseUnits("50000", 18));
    });

    checkCorePoolComptroller();
  });

  testVip("VIP-101 Venus Recommend Parameters", vip224(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("supply cap of UNI equals 200K UNI", async () => {
      const newCap = await comptroller.supplyCaps(VUNI);
      expect(newCap).to.equal(parseUnits("200000", 18));
    });

    it("borrow cap of UNI equals 100K UNI", async () => {
      const newCap = await comptroller.borrowCaps(VUNI);
      expect(newCap).to.equal(parseUnits("100000", 18));
    });

    checkCorePoolComptroller();
  });
});
