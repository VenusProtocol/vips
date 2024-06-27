import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip143 } from "../../vips/vip-143";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const VWBETH = "0x6cfdec747f37daf3b87a35a1d9c8ad3063a1a8a0";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";

forking(29989714, async () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Caps Check", async () => {
    it("supply cap of WBETH equals 4000", async () => {
      const oldCap = await comptroller.supplyCaps(VWBETH);
      expect(oldCap).to.equal(parseUnits("4000", 18));
    });

    it("borrow cap of WBETH  equals 550", async () => {
      const oldCap = await comptroller.borrowCaps(VWBETH);
      expect(oldCap).to.equal(parseUnits("550", 18));
    });
  });

  testVip("VIP-143 Risk Parameters Update", await vip143(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap", "NewSupplyCap", "Failure"], [1, 1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("supply cap of WBETH equals 8000", async () => {
      const newCap = await comptroller.supplyCaps(VWBETH);
      expect(newCap).to.equal(parseUnits("8000", 18));
    });

    it("borrow cap of WBETH  equals 1100", async () => {
      const newCap = await comptroller.borrowCaps(VWBETH);
      expect(newCap).to.equal(parseUnits("1100", 18));
    });
  });
});
