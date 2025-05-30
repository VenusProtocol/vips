import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip506, {
  ARB_vUSDC_Core,
  ARB_vUSDC_Core_IRM,
  ARB_vUSDT_Core,
  ARB_vUSDT_Core_IRM,
} from "../../vips/vip-506/bsctestnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const SECONDS_PER_YEAR = 31_536_000;

forking(157328501, async () => {
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      const vUSDC_Core = new ethers.Contract(ARB_vUSDC_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDC_Core.interestRateModel()).to.equals("0xBbb522fCA8f5955942515D8EAa2222251a070a17");

      const vUSDT_Core = new ethers.Contract(ARB_vUSDT_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDT_Core.interestRateModel()).to.equals("0xBbb522fCA8f5955942515D8EAa2222251a070a17");
    });

    checkInterestRate(
      "0xBbb522fCA8f5955942515D8EAa2222251a070a17",
      "USDC_CORE_USDT_CORE)",
      {
        base: "0",
        multiplier: "0.075",
        jump: "2.5",
        kink: "0.8",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );
  });

  testForkedNetworkVipCommands("VIP 506", await vip506(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [2]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check IRM address", async () => {
      const vUSDC_Core = new ethers.Contract(ARB_vUSDC_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDC_Core.interestRateModel()).to.equals(ARB_vUSDT_Core_IRM);

      const vUSDT_Core = new ethers.Contract(ARB_vUSDT_Core, VTOKEN_ABI, ethers.provider);
      expect(await vUSDT_Core.interestRateModel()).to.equals(ARB_vUSDC_Core_IRM);
    });

    checkTwoKinksInterestRateIL(
      ARB_vUSDC_Core_IRM,
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

    checkTwoKinksInterestRateIL(
      ARB_vUSDT_Core_IRM,
      "USDT_Core",
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
