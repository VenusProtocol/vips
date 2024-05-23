import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import {
  NEW_BASE_RATE_MANTISSA,
  NEW_FLOAT_RATE_MANTISSA,
  OLD_BASE_RATE_MANTISSA,
  OLD_FLOAT_RATE_MANTISSA,
  VAI_CONTROLLER_PROXY,
  vip246,
} from "../../vips/vip-246/bscmainnet";
import VAI_CONTROLLER_ABI from "./abi/VAIController_ABI.json";

forking(35363483, () => {
  const provider = ethers.provider;
  let vaiControllerProxy: Contract;

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

  testVip("VIP-246 Set VAI risk parameters", vip246(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VAI_CONTROLLER_ABI], ["NewVAIBaseRate", "NewVAIFloatRate"], [1, 1]);
    },
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
