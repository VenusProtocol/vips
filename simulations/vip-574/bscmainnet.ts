import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import { IRM, vUSDC, vUSDT, vip574 } from "../../vips/vip-574/bscmainnet";
import VTOKEN_ABI from "./abi/vToken.json";

const OLD_vUSDT_IRM = "0x1a7c9091973CABc491e361A9eaEFD047b48a3647";
const OLD_vUSDC_IRM = "0xF48508A44da9C7D210a668eCe4d31Bc98702602b";

forking(69755774, async () => {
  const vUSDTContract = new ethers.Contract(vUSDT, VTOKEN_ABI, ethers.provider);
  const vUSDCContract = new ethers.Contract(vUSDC, VTOKEN_ABI, ethers.provider);

  describe("Pre-VIP behaviour", async () => {
    it("check IRM of vUSDT and vUSDC", async () => {
      const vUSDT_IRM = await vUSDTContract.interestRateModel();
      const vUSDC_IRM = await vUSDCContract.interestRateModel();

      expect(vUSDT_IRM).to.equal(OLD_vUSDT_IRM);
      expect(vUSDC_IRM).to.equal(OLD_vUSDC_IRM);
    });
    checkTwoKinksInterestRate(OLD_vUSDT_IRM, "vUSDT", {
      base: "0",
      multiplier: "0.0875",
      kink1: "0.8",
      multiplier2: "0.20",
      base2: "0",
      kink2: "0.9",
      jump: "3",
    });

    checkTwoKinksInterestRate(OLD_vUSDC_IRM, "vUSDC", {
      base: "0",
      multiplier: "0.08125",
      kink1: "0.8",
      multiplier2: "0.20",
      base2: "0",
      kink2: "0.9",
      jump: "3",
    });
  });

  testVip("VIP-574", await vip574(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check IRM of vUSDC and vUSDT", async () => {
      const vUSDT_IRM = await vUSDTContract.interestRateModel();
      const vUSDC_IRM = await vUSDCContract.interestRateModel();

      expect(vUSDT_IRM).to.equal(IRM);
      expect(vUSDC_IRM).to.equal(IRM);
    });

    checkTwoKinksInterestRate(IRM, "vUSDT_vUSDC", {
      base: "0",
      multiplier: "0.065476190437632000",
      kink1: "0.84",
      multiplier2: "0.249999999959808000",
      base2: "0",
      kink2: "0.92",
      jump: "4.0625000000000015",
    });
  });
});
