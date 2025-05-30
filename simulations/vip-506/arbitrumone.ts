import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";
import { checkTwoKinksInterestRateIL } from "src/vip-framework/checks/interestRateModel";

import vip506, {
  ARB_vUSDC_Core,
  ARB_vUSDC_Core_IRM,
  ARB_vUSDT_Core,
  ARB_vUSDT_Core_IRM,
} from "../../vips/vip-506/bscmainnet";
import VTOKEN_ABI from "./abi/VToken.json";

export const SECONDS_PER_YEAR = 31_536_000; // seconds per year

let vUSDC_Core: Contract;
let vUSDT_Core: Contract;

forking(342077800, async () => {
  before(async () => {
    vUSDC_Core = new ethers.Contract(ARB_vUSDC_Core, VTOKEN_ABI, ethers.provider);
    vUSDT_Core = new ethers.Contract(ARB_vUSDT_Core, VTOKEN_ABI, ethers.provider);
  });
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      expect(await vUSDC_Core.interestRateModel()).to.equals("0x8fd05f11a175A9b7E6dDcA8Ee2713E2c7f94c011");
      expect(await vUSDT_Core.interestRateModel()).to.equals("0x8fd05f11a175A9b7E6dDcA8Ee2713E2c7f94c011");
    });

    checkTwoKinksInterestRateIL(
      "0x8fd05f11a175A9b7E6dDcA8Ee2713E2c7f94c011",
      "USDC_CORE_USDT_CORE)",
      {
        base: "0",
        multiplier: "0.15",
        kink1: "0.8",
        multiplier2: "0.9",
        base2: "0",
        kink2: "0.9",
        jump: "3.0",
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
      expect(await vUSDC_Core.interestRateModel()).to.equals(ARB_vUSDT_Core_IRM);
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
        jump: "3.0",
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
        jump: "3.0",
      },
      BigNumber.from(SECONDS_PER_YEAR),
    );
  });
});
