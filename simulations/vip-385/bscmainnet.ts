import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip385, { IRM } from "../../vips/vip-385/bscmainnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";

const OLD_IRM = "0xDb8347b96c94Be24B9c077A4CDDAAD074F6480cf";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

forking(43192903, async () => {
  const provider = ethers.provider;

  const vBNB = new ethers.Contract(VBNB, VTOKEN_CORE_POOL_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("has expected interest rate model addresses", async () => {
      expect(await vBNB.interestRateModel()).to.equal(OLD_IRM);
    });

    describe("old interest rate model parameters", async () => {
      checkInterestRate(OLD_IRM, "vBNB", {
        base: "0",
        multiplier: "0.225",
        jump: "6.8",
        kink: "0.5",
      });
    });
  });

  testVip("VIP-385", await vip385(), {
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
        multiplier2: "0.35",
        base2: "0.21",
        kink2: "0.7",
        jump: "5",
      });
    });
  });
});
