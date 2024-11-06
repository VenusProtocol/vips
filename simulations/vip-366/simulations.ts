import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEventWithParams, expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import { vip366 } from "../../vips/vip-366/bscmainnet";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20DelegatorAbi.json";

const VBNB_CORE = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

const IR_NEW = "0xDb8347b96c94Be24B9c077A4CDDAAD074F6480cf";
const IR_OLD = "0xe5be8D9f4697dD264e488efD4b29c8CC31616fa5";

forking(42299565, async () => {
  let vBNB: Contract;

  before(async () => {
    vBNB = new ethers.Contract(VBNB_CORE, VBEP20_DELEGATOR_ABI, ethers.provider);
  });

  describe("IR check", async () => {
    it("Should match current interest rate model", async () => {
      expect(await vBNB.interestRateModel()).to.equal(IR_OLD);
    });
  });

  testVip("VIP-366 Core Pool BNB IR Curve Update", await vip366(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VBEP20_DELEGATOR_ABI], ["NewMarketInterestRateModel"], [1]);
      await expectEventWithParams(txResponse, VBEP20_DELEGATOR_ABI, "NewMarketInterestRateModel", [IR_OLD, IR_NEW]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("sets new InterestRateModel", async () => {
      expect(await vBNB.interestRateModel()).to.equal(IR_NEW);
    });

    checkInterestRate(IR_NEW, "vBNB", {
      base: "0",
      multiplier: "0.225",
      jump: "6.8",
      kink: "0.5",
    });
  });
});
