import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { vip125 } from "../../vips/vip-125";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const VXVS = "0x151B1e2635A717bcDc836ECd6FbB62B674FE3E1D";

forking(28884543, () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("supply cap of XVS equals 1000000", async () => {
      const oldCap = await comptroller.supplyCaps(VXVS);
      expect(oldCap).to.equal(parseUnits("1000000", 18));
    });
  });

  testVip("VIP-125 Risk Parameters Update", vip125(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap", "Failure"], [1, 0]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("supply cap of XVS equals 1300000", async () => {
      const newCap = await comptroller.supplyCaps(VXVS);
      expect(newCap).to.equal(parseUnits("1300000", 18));
    });
  });
});
