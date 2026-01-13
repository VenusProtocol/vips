import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vU, vip581Addendum2 } from "../../vips/vip-581/addendum2";
import VTOKEN_ABI from "../vip-567/abi/VToken.json";

forking(75048491, async () => {
  let vUContract: Contract;

  before(async () => {
    vUContract = new ethers.Contract(vU, VTOKEN_ABI, ethers.provider);
  });

  describe("Pre-VIP checks", () => {
    it("vU has flash loans disabled", async () => {
      const isFlashLoanEnabled = await vUContract.isFlashLoanEnabled();
      expect(isFlashLoanEnabled).to.be.equal(false);
    });
  });

  testVip("VIP-581 Addendum2", await vip581Addendum2(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["FlashLoanStatusChanged"], [1]);
    },
  });

  describe("Post-VIP checks", () => {
    it("vU has flash loans enabled", async () => {
      const isFlashLoanEnabled = await vUContract.isFlashLoanEnabled();
      expect(isFlashLoanEnabled).to.be.equal(true);
    });
  });
});
