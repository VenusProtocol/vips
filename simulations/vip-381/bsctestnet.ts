import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip381, { IRM } from "../../vips/vip-381/bsctestnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";

const OLD_IRM = "0x597F1eFCC8DD59598eD1944304814f60230BAe76";
const VBNB = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";

forking(44524703, async () => {
  const provider = ethers.provider;

  const vBNB = new ethers.Contract(VBNB, VTOKEN_CORE_POOL_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("has expected interest rate model addresses", async () => {
      expect(await vBNB.interestRateModel()).to.equal(OLD_IRM);
    });
  });

  testVip("VIP-381", await vip381(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_CORE_POOL_ABI], ["NewMarketInterestRateModel"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("has the new interest rate model addresses", async () => {
      expect(await vBNB.interestRateModel()).to.equal(IRM);
    });

    describe("new interest rate model parameters", async () => {
      checkTwoKinksInterestRate(IRM, "vBNB", {
        base: "0",
        multiplier: "0.225",
        kink1: "0.4",
        multiplier2: "0.5",
        base2: "0.1",
        kink2: "0.7",
        jump: "6.8",
      });
    });
  });
});
