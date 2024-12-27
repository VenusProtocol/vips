import { TransactionResponse } from "@ethersproject/providers";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip411, {
  BSC_DAI_TUSD_IRM,
  BSC_TWO_KINKS_IRM,
  BSC_USDT_DEFI_GAMEFI_IRM,
  BSC_USDT_MEME_IRM,
  BSC_USDT_TRON_IRM,
} from "../../vips/vip-411/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VTOKEN_ABI from "./abi/VToken.json";

forking(45235835, async () => {
  describe("Pre-VIP behaviour", () => {
    checkInterestRate("0x62A8919C4C413fd4F9aef7348540Bc4B1b5CC805", "DAI_TUSD_CORE", {
      base: "0",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate("0x3aB2e4594D9C81455b330B423Dec61E49EB11667", "USDT_DEFI_GAMEFI_CORE", {
      base: "0.02",
      multiplier: "0.135",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate("0xDdeb3556b325D5578575c6eF0F855b73D2323E34", "USDT_MEME_CORE", {
      base: "0",
      multiplier: "0.175",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate("0x009cdFB248e021f58A34B50dc2A7601EA72d14Ac", "USDT_TRON_CORE", {
      base: "0.02",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.8",
    });
  });

  testVip("vip-411", await vip411(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );

      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [4]);
    },
  });

  describe("Post-VIP behavior", () => {
    checkTwoKinksInterestRate(BSC_TWO_KINKS_IRM, "USDC_USDT_CORE", {
      base: "0",
      multiplier: "0.15",
      kink1: "0.8",
      multiplier2: "0.9",
      base2: "0",
      kink2: "0.9",
      jump: "3",
    });

    checkInterestRate(BSC_DAI_TUSD_IRM, "DAI_TUSD_CORE", {
      base: "0",
      multiplier: "0.175",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate(BSC_USDT_DEFI_GAMEFI_IRM, "USDT_DEFI_GAMEFI_CORE", {
      base: "0.02",
      multiplier: "0.2",
      jump: "2.5",
      kink: "0.8",
    });

    // Fix this IRM
    checkInterestRate(BSC_USDT_MEME_IRM, "USDT_MEME_CORE", {
      base: "0.03",
      multiplier: "0.2",
      jump: "2.5",
      kink: "0.6",
    });

    // Fix this IRM
    checkInterestRate(BSC_USDT_TRON_IRM, "USDT_TRON_CORE", {
      base: "0",
      multiplier: "0.2",
      jump: "2.5",
      kink: "0.8",
    });
  });
});
