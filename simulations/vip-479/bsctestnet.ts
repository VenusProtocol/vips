import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip479, { IRM } from "../../vips/vip-479/bsctestnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";

const OLD_IRM = "0x86954c6fCA6B464269Aa7011B143c4D93Dfa1146";
const VBNB = "0x2E7222e51c0f6e98610A1543Aa3836E092CDe62c";

forking(50001532, async () => {
  const provider = ethers.provider;

  const vBNB = new ethers.Contract(VBNB, VTOKEN_CORE_POOL_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("has expected interest rate model addresses", async () => {
      expect(await vBNB.interestRateModel()).to.equal(OLD_IRM);
    });

    describe("old interest rate model parameters", async () => {
      checkTwoKinksInterestRate(OLD_IRM, "vBNB", {
        base: "0",
        multiplier: "0.225",
        kink1: "0.4",
        multiplier2: "0.35",
        base2: "0.21",
        kink2: "0.7",
        jump: "5",
      });
    });
  });

  testVip("VIP-479", await vip479(), {
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
        multiplier: "0.125",
        kink1: "0.4",
        multiplier2: "0.9",
        base2: "0.05",
        kink2: "0.8",
        jump: "5",
      });
    });
  });
});
