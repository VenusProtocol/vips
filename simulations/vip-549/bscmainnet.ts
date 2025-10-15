import { TransactionResponse } from "@ethersproject/providers";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import { vUSDC_IRM, vUSDT_IRM, vip549 } from "../../vips/vip-549/bscmainnet";
import VTOKEN_ABI from "./abi/vToken.json";

const OLD_IRM = "0x08437b3C0BeA58fE6eC696a04c9675E0980b9469";

forking(62859899, async () => {
  describe("Pre-VIP behaviour", async () => {
    checkTwoKinksInterestRate(OLD_IRM, "vUSDC_vUSDT", {
      base: "0",
      multiplier: "0.1",
      kink1: "0.8",
      multiplier2: "0.7",
      base2: "0",
      kink2: "0.9",
      jump: "3",
    });
  });

  testVip("VIP-549", await vip549(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    checkTwoKinksInterestRate(vUSDT_IRM, "vUSDT", {
      base: "0",
      multiplier: "0.0875",
      kink1: "0.8",
      multiplier2: "0.2",
      base2: "0",
      kink2: "0.9",
      jump: "3",
    });

    checkTwoKinksInterestRate(vUSDC_IRM, "vUSDC", {
      base: "0",
      multiplier: "0.08125",
      kink1: "0.8",
      multiplier2: "0.2",
      base2: "0",
      kink2: "0.9",
      jump: "3",
    });
  });
});
