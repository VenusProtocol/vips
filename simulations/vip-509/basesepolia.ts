import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip509, { BASE_vUSDC_Core, BASE_vUSDC_Core_IRM } from "../../vips/vip-509/bsctestnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const SECONDS_PER_YEAR = 31_536_000; // seconds per year

forking(26290932, async () => {
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      const vUSDC_Core = new ethers.Contract(BASE_vUSDC_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDC_Core.interestRateModel()).to.equals("0x37a3e7951795d3aF33D606A9591B8EBd5F84DA08");
    });

    checkInterestRate(
      "0x37a3e7951795d3aF33D606A9591B8EBd5F84DA08",
      "USDC_CORE",
      {
        base: "0",
        multiplier: "0.075",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );
  });

  testForkedNetworkVipCommands("VIP 509", await vip509(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [1]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check IRM address", async () => {
      const vUSDC_Core = new ethers.Contract(BASE_vUSDC_Core, VTOKEN_ABI, ethers.provider);
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
