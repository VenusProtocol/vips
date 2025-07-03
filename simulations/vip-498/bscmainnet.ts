import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip498, { COMPTROLLER_CORE, NEW_IR, vSOL } from "../../vips/vip-498/bscmainnet";
import VTOKEN_CORE_POOL_ABI from "./abi/VTokenCorePool.json";
import CORE_COMPTROLLER_ABI from "./abi/coreComptroller.json";

const OLD_IRM = "0xfCFE909330FF50D2c72715cBEC4E54c476c27CEC";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

forking(49762075, async () => {
  const provider = ethers.provider;

  const vBNB = new ethers.Contract(VBNB, VTOKEN_CORE_POOL_ABI, provider);
  const coreComptroller = new ethers.Contract(COMPTROLLER_CORE, CORE_COMPTROLLER_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("check vSOL supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vSOL);
      expect(supplyCap).equals(parseUnits("36000", 18));
    });

    it("has expected interest rate model addresses", async () => {
      expect(await vBNB.interestRateModel()).to.equal(OLD_IRM);
    });

    describe("old interest rate model parameters", async () => {
      checkTwoKinksInterestRate(OLD_IRM, "vBNB", {
        base: "0",
        multiplier: "0.035",
        kink1: "0.8",
        multiplier2: "1.75",
        base2: "0",
        kink2: "0.9",
        jump: "3",
      });
    });
  });

  testVip("VIP-498", await vip498(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_CORE_POOL_ABI], ["NewMarketInterestRateModel"], [1]);
      await expectEvents(txResponse, [CORE_COMPTROLLER_ABI], ["NewSupplyCap"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check vSOL supply cap", async () => {
      const supplyCap = await coreComptroller.supplyCaps(vSOL);
      expect(supplyCap).equals(parseUnits("72000", 18));
    });

    it("has the new interest rate model addresses", async () => {
      expect(await vBNB.interestRateModel()).to.equal(NEW_IR);
    });

    describe("new interest rate model parameters", async () => {
      checkTwoKinksInterestRate(NEW_IR, "vBNB", {
        base: "0",
        multiplier: "0.045",
        kink1: "0.65",
        multiplier2: "1.4",
        base2: "0",
        kink2: "0.8",
        jump: "3",
      });
    });
  });
});
