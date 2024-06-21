import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { FEE_OUT, PSM_USDT, vip159 } from "../../vips/vip-159";
import PSM_ABI from "./abi/PSM_ABI.json";

console.log({ FEE_OUT, PSM_USDT });

forking(30851821, async () => {
  let psm: Contract;
  const provider = ethers.provider;

  before(async () => {
    psm = new ethers.Contract(PSM_USDT, PSM_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("Verify feeOut", async () => {
      expect(await psm.feeOut()).to.equal(100);
    });
  });

  testVip("VIP-159 Risk Parameters Update", await vip159(), {
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
