import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vip208 } from "../../../vips/vip-208/vip-208";
import COMPTROLLER_ABI from "./abi/Comptroller_ABI.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VUNI = "0x27FF564707786720C71A2e5c1490A63266683612";

forking(33668728, () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });
  describe("Pre-VIP behaviour", () => {
    it("should have supply cap of 50,000", async () => {
      expect(await comptroller.supplyCaps(VUNI)).to.equals(parseUnits("50000", 18));
    });
    it("should have borrow cap of 30,000", async () => {
      expect(await comptroller.borrowCaps(VUNI)).to.equals(parseUnits("30000", 18));
    });
  });
  testVip("VIP-208 Update Risk Parameters", vip208(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "NewBorrowCap", "Failure"], [1, 1, 0]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("sets new supply cap of 100,000", async () => {
      expect(await comptroller.supplyCaps(VUNI)).to.equals(parseUnits("100000", 18));
    });
    it("sets new borrow cap of 50,000", async () => {
      expect(await comptroller.borrowCaps(VUNI)).to.equals(parseUnits("50000", 18));
    });
  });
});
