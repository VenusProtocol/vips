import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { FEE_OUT, PSM_USDT, vip158 } from "../../vips/vip-158";
import PSM_ABI from "./abi/PSM_ABI.json";

console.log({ FEE_OUT, PSM_USDT });

forking(30851821, () => {
  let psm: ethers.Contract;
  const provider = ethers.provider;

  before(async () => {
    psm = new ethers.Contract(PSM_USDT, PSM_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Verify feeOut", async () => {
      expect(await psm.feeOut()).to.equal(100);
    });
  });

  testVip("VIP-158 Risk Parameters Update", vip158(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [PSM_ABI], ["FeeOutChanged"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify feeOut", async () => {
      expect(await psm.feeOut()).to.equal(FEE_OUT);
    });
  });
});
