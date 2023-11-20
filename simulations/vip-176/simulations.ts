import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  NEW_BASE_RATE_MANTISSA,
  NEW_FLOAT_RATE_MANTISSA,
  OLD_BASE_RATE_MANTISSA,
  OLD_FLOAT_RATE_MANTISSA,
  VAI_CONTROLLER_PROXY,
  vip176,
} from "../../vips/vip-176";
import VAI_CONTROLLER_ABI from "./abi/VAIController_ABI.json";

forking(32052800, () => {
  const provider = ethers.provider;
  let vaiControllerProxy: ethers.Contract;

  before(async () => {
    vaiControllerProxy = new ethers.Contract(VAI_CONTROLLER_PROXY, VAI_CONTROLLER_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify VAI base rate is 4%", async () => {
      const currentBaseRate = await vaiControllerProxy.baseRateMantissa();
      expect(currentBaseRate).equals(OLD_BASE_RATE_MANTISSA);
    });
    it("Verify VAI float rate is 225%", async () => {
      const currentFloatRate = await vaiControllerProxy.floatRateMantissa();
      expect(currentFloatRate).equals(OLD_FLOAT_RATE_MANTISSA);
    });
  });

  testVip("VIP-176 Set VAI risk parameters", vip176(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VAI_CONTROLLER_ABI], ["NewVAIBaseRate", "NewVAIFloatRate"], [1, 1]);
    },
    proposer: "0xc444949e0054a23c44fc45789738bdf64aed2391",
    supporter: "0x55A9f5374Af30E3045FB491f1da3C2E8a74d168D",
  });

  describe("Post-VIP behavior", async () => {
    it("Verify new VAI base rate is 3.00%", async () => {
      const currentBaseRate = await vaiControllerProxy.baseRateMantissa();
      expect(currentBaseRate).equals(NEW_BASE_RATE_MANTISSA);
    });
    it("Verify new VAI float rate is 4000%", async () => {
      const currentFloatRate = await vaiControllerProxy.floatRateMantissa();
      expect(currentFloatRate).equals(NEW_FLOAT_RATE_MANTISSA);
    });
  });
});
