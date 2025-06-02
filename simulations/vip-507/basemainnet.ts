import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip507, { BASE_vUSDC_Core, BASE_vUSDC_Core_IRM } from "../../vips/vip-507/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const SECONDS_PER_YEAR = 31_536_000; // seconds per year

forking(30907412, async () => {
  let vUSDC_Core: Contract;

  before(async () => {
    vUSDC_Core = new ethers.Contract(BASE_vUSDC_Core, VTOKEN_ABI, ethers.provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      expect(await vUSDC_Core.interestRateModel()).to.equals("0xB7FCED42486F8DB8155fD509e726F9604fCdd41F");
    });

    checkInterestRate(
      "0xB7FCED42486F8DB8155fD509e726F9604fCdd41F",
      "USDC_CORE",
      {
        base: "0",
        multiplier: "0.08",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );
  });

  testForkedNetworkVipCommands("VIP 507", await vip507(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check IRM address", async () => {
      expect(await vUSDC_Core.interestRateModel()).to.equals(BASE_vUSDC_Core_IRM);
    });

    checkTwoKinksInterestRateIL(
      BASE_vUSDC_Core_IRM,
      "USDC_Core",
      {
        base: "0",
        multiplier: "0.1",
        kink1: "0.8",
        multiplier2: "0.7",
        base2: "0",
        kink2: "0.9",
        jump: "2.5",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );
  });
});
