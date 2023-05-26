import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip122 } from "../../vips/vip-122";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const OLD_VTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const VSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";

forking(28541594, () => {
  let comptroller: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("supply cap of TRX (old) equals 81207000000000000000", async () => {
      const oldCap = await comptroller.supplyCaps(OLD_VTRX);
      expect(oldCap).to.equal(parseUnits("81207000000000000000", 6));
    });

    it("borrow cap of TRX (old) equals 18853000000000000000", async () => {
      const oldCap = await comptroller.borrowCaps(OLD_VTRX);
      expect(oldCap).to.equal(parseUnits("18853000000000000000", 6));
    });

    it("supply cap of SXP equals 55052000", async () => {
      const oldCap = await comptroller.supplyCaps(VSXP);
      expect(oldCap).to.equal(parseUnits("55052000", 18));
    });

    it("borrow cap of SXP equals 8100000", async () => {
      const oldCap = await comptroller.borrowCaps(VSXP);
      expect(oldCap).to.equal(parseUnits("8100000", 18));
    });
  });

  testVip("VIP-122 Risk Parameters Update", vip122(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap", "NewSupplyCap", "Failure"], [2, 2, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("supply cap of TRX (old) equals 0", async () => {
      const newCap = await comptroller.supplyCaps(OLD_VTRX);
      expect(newCap).to.equal(0);
    });

    it("borrow cap of TRX (old) equals 0", async () => {
      const newCap = await comptroller.borrowCaps(OLD_VTRX);
      expect(newCap).to.equal(0);
    });

    it("supply cap of SXP equals 0", async () => {
      const newCap = await comptroller.supplyCaps(VSXP);
      expect(newCap).to.equal(0);
    });

    it("borrow cap of SXP equals 0", async () => {
      const newCap = await comptroller.borrowCaps(VSXP);
      expect(newCap).to.equal(0);
    });
  });
});
