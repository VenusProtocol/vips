import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip125 } from "../../vips/vip-125";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const OLD_vTRX = "0x61eDcFe8Dd6bA3c891CB9bEc2dc7657B3B422E93";
const vSXP = "0x2fF3d0F6990a40261c66E1ff2017aCBc282EB6d0";
const vBUSD = "0x95c78222b3d6e262426483d42cfa53685a67ab9d";

const forkBlockNumber = 28829209; // Jun-05-2023 07:07:57 AM +UTC

forking(forkBlockNumber, () => {
  let comptroller: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Borrow caps check", async () => {
    it("borrow cap of BUSD equals 130M", async () => {
      const expectedCap = parseUnits("130000000", 18); // 130 M
      const oldCap = await comptroller.borrowCaps(vBUSD);
      expect(oldCap).to.equal(expectedCap);
    });

    it("borrow cap of TRX (old) equals 0", async () => {
      const oldCap = await comptroller.borrowCaps(OLD_vTRX);
      expect(oldCap).to.equal(0);
    });

    it("supply cap of SXP equals 0", async () => {
      const oldCap = await comptroller.supplyCaps(vSXP);
      expect(oldCap).to.equal(0);
    });
  });

  testVip("VIP-125 Borrow Cap Updates", vip125(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewBorrowCap", "Failure"], [3, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("borrow cap of TRX (old) equals 1", async () => {
      const newCap = await comptroller.borrowCaps(OLD_vTRX);
      expect(newCap).to.equal(1);
    });

    it("supply cap of SXP equals 0", async () => {
      const newCap = await comptroller.borrowCaps(vSXP);
      expect(newCap).to.equal(1);
    });

    it("borrow cap of BUSD equals 80 M", async () => {
      const newCap = await comptroller.borrowCaps(vBUSD);
      expect(newCap).to.equal(parseUnits("80000000", 18)); // 80 M;
    });
  });
});
