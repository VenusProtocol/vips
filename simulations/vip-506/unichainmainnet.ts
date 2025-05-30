import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip506, { UNI_vUSDC_Core, UNI_vUSDC_Core_IRM } from "../../vips/vip-506/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const SECONDS_PER_YEAR = 31_536_000; // seconds per year
let vUSDC_Core: Contract;

forking(17858329, async () => {
  before(async () => {
    vUSDC_Core = new ethers.Contract(UNI_vUSDC_Core, VTOKEN_ABI, ethers.provider);
  });
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      expect(await vUSDC_Core.interestRateModel()).to.equals("0x2DAb0B51d7d899b66d4F16EA1c0cEB1767863523");
    });

    checkInterestRate(
      "0x2DAb0B51d7d899b66d4F16EA1c0cEB1767863523",
      "USDC_CORE",
      {
        base: "0",
        multiplier: "0.125",
        jump: "3",
        kink: "0.8",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );
  });

  testForkedNetworkVipCommands("VIP 506", await vip506(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check IRM address", async () => {
      expect(await vUSDC_Core.interestRateModel()).to.equals(UNI_vUSDC_Core_IRM);
    });

    checkTwoKinksInterestRateIL(
      UNI_vUSDC_Core_IRM,
      "USDC_Core",
      {
        base: "0",
        multiplier: "0.1",
        kink1: "0.8",
        multiplier2: "0.7",
        base2: "0",
        kink2: "0.9",
        jump: "3",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );
  });
});
