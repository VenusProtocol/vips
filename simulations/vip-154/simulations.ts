import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { COMPTROLLER, NEW_SUPPLY_CAP, VWBETH, vip154 } from "../../vips/vip-154";
import COMPTROLLER_ABI from "./abi/comptroller.json";

forking(30669350, () => {
  let comptroller: Contract;
  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
  });

  testVip("VIP-154 Risk Parameters Update", vip154(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("correct WBETH supply cap of 16000", async () => {
      expect(await comptroller.supplyCaps(VWBETH)).to.equal(NEW_SUPPLY_CAP);
    });
  });
});
