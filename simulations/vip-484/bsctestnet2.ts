import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip484 from "../../vips/vip-484/bsctestnet2";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";

const VBNB = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";

forking(50431097, async () => {
  const provider = ethers.provider;

  const vBNB = new ethers.Contract(VBNB, VTOKEN_CORE_POOL_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("check reserve factor", async () => {
      expect(await vBNB.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("0.25", 18));
    });
  });

  testVip("VIP-484", await vip484(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_CORE_POOL_ABI], ["NewReserveFactor"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check reserve factor", async () => {
      expect(await vBNB.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("0.1", 18));
    });
  });
});
