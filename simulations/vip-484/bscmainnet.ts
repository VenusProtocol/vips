import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip484, { IRM } from "../../vips/vip-484/bscmainnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";

const OLD_IRM = "0xb16Db373A194acb9018919B77ae480f2a8f0F128";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

forking(48492804, async () => {
  const provider = ethers.provider;

  const vBNB = new ethers.Contract(VBNB, VTOKEN_CORE_POOL_ABI, provider);

  describe("Pre-VIP behaviour", async () => {
    it("has expected interest rate model addresses", async () => {
      expect(await vBNB.interestRateModel()).to.equal(OLD_IRM);
    });

    describe("old interest rate model parameters", async () => {
      checkTwoKinksInterestRate(OLD_IRM, "vBNB", {
        base: "0",
        multiplier: "0.125",
        kink1: "0.4",
        multiplier2: "0.9",
        base2: "0.05",
        kink2: "0.8",
        jump: "5",
      });
    });

    it("check reserve factor", async () => {
      expect(await vBNB.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("0.3", 18));
    });
  });

  testVip("VIP-484", await vip484(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [VTOKEN_CORE_POOL_ABI],
        ["NewMarketInterestRateModel", "NewReserveFactor"],
        [1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("has the new interest rate model addresses", async () => {
      expect(await vBNB.interestRateModel()).to.equal(IRM);
    });

    describe("new interest rate model parameters", async () => {
      checkTwoKinksInterestRate(IRM, "vBNB", {
        base: "0",
        multiplier: "0.035",
        kink1: "0.8",
        multiplier2: "1.75",
        base2: "0",
        kink2: "0.9",
        jump: "3",
      });
    });

    it("check reserve factor", async () => {
      expect(await vBNB.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("0.1", 18));
    });
  });
});
