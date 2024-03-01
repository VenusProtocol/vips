import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEventWithParams, expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { checkInterestRate } from "../../src/vip-framework/checks/interestRateModel";
import { vip264 } from "../../vips/vip-264";
import ILIR_ABI from "./abi/ILInterestRateModelABI.json";
import RATE_MODEL_ABI from "./abi/RateModelAbi.json";
import VBEP20_DELEGATOR_ABI from "./abi/VBep20DelegatorAbi.json";

const VBNB_CORE = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";

const IR_NEW = "0xF558Be24F2CACb65a4BB41A155631C83B15388F1";
const IR_OLD = "0x8B5351D0568CEEFa9BfC71C7a11C01179B736d99";

forking(36584000, () => {
  let vBNB: ethers.Contract;

  before(async () => {
    vBNB = new ethers.Contract(VBNB_CORE, VBEP20_DELEGATOR_ABI, ethers.provider);
  });

  describe("IR check", async () => {
    it("Should match current interest rate model", async () => {
      expect(await vBNB.interestRateModel()).to.equal(IR_OLD);
    });
  });

  testVip("VIP-264 Core Pool BNB IR Curve Update", vip264(), {
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
      kink: "0.8",
    });
  });
});
