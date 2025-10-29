import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import { IRM, RESERVE_FACTOR, vBNB, vWBNB, vip559 } from "../../vips/vip-559/bscmainnet";
import VTOKEN_ABI from "./abi/vToken.json";

const OLD_vBNB_IRM = "0xF78db86E58dc1b76569a0b3105EF5186033911A1";
const OLD_vWBNB_IRM = "0xE82B36f4CE8A9B769036B74354588D427a724763";

forking(66303936, async () => {
  const vBNBContract = new ethers.Contract(vBNB, VTOKEN_ABI, ethers.provider);
  const vWBNBContract = new ethers.Contract(vWBNB, VTOKEN_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("check IRM of vBNB and vWBNB", async () => {
      const vBNB_irm = await vBNBContract.interestRateModel();
      const vWBNB_irm = await vWBNBContract.interestRateModel();

      expect(vBNB_irm).to.equal(OLD_vBNB_IRM);
      expect(vWBNB_irm).to.equal(OLD_vWBNB_IRM);
    });
    checkTwoKinksInterestRate(OLD_vBNB_IRM, "vBNB", {
      base: "0",
      multiplier: "0.045",
      kink1: "0.7",
      multiplier2: "1.4",
      base2: "0",
      kink2: "0.8",
      jump: "3",
    });

    checkTwoKinksInterestRate(OLD_vWBNB_IRM, "vWBNB", {
      base: "0",
      multiplier: "0.045",
      kink1: "0.7",
      multiplier2: "1.4",
      base2: "0",
      kink2: "0.8",
      jump: "3",
    });

    it("check reserve factor of vWBNB", async () => {
      const vWBNB_reserveFactor = await vWBNBContract.reserveFactorMantissa();
      expect(vWBNB_reserveFactor).to.equal(parseUnits("0.3", 18));
    });
  });

  testVip("VIP-559", await vip559(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel", "NewReserveFactor"], [2, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check IRM of vBNB and vWBNB", async () => {
      const vBNB_irm = await vBNBContract.interestRateModel();
      const vWBNB_irm = await vWBNBContract.interestRateModel();

      expect(vBNB_irm).to.equal(IRM);
      expect(vWBNB_irm).to.equal(IRM);
    });

    checkTwoKinksInterestRate(IRM, "vBNB", {
      base: "0",
      multiplier: "0.045",
      kink1: "0.8",
      multiplier2: "1.4",
      base2: "0",
      kink2: "0.9",
      jump: "3",
    });

    it("check reserve factor of vWBNB", async () => {
      const vWBNB_reserveFactor = await vWBNBContract.reserveFactorMantissa();
      expect(vWBNB_reserveFactor).to.equal(RESERVE_FACTOR);
    });
  });
});
