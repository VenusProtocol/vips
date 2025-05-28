import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { newRF, vBNB, vip507 } from "../../vips/vip-507/bsctestnet";
import VTOKEN_ABI from "./abi/VToken.json";

forking(52603412, async () => {
  const provider = ethers.provider;

  const vBNB_CONTRACT = new ethers.Contract(vBNB, VTOKEN_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check reserve factor", async () => {
      expect(await vBNB_CONTRACT.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("0.1", 18));
    });
  });

  testVip("VIP-507", await vip507(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewReserveFactor"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check reserve factor", async () => {
      expect(await vBNB_CONTRACT.reserveFactorMantissa()).to.equal(newRF);
    });
  });
});
