import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip415, {
  BSC_DAI_TUSD_IRM,
  BSC_TWO_KINKS_IRM,
  BSC_USDT_DEFI_GAMEFI_TRON_IRM,
  BSC_USDT_MEME_IRM,
  vDAI_BSC_CORE,
  vTUSD_BSC_CORE,
  vUSDC_BSC_CORE,
  vUSDT_BSC_CORE,
  vUSDT_BSC_DEFI,
  vUSDT_BSC_GAMEFI,
  vUSDT_BSC_MEME,
  vUSDT_BSC_TRON,
} from "../../vips/vip-415/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VTOKEN_ABI from "./abi/VToken.json";

forking(45237826, async () => {
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      let vToken = new ethers.Contract(vDAI_BSC_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0x62A8919C4C413fd4F9aef7348540Bc4B1b5CC805");

      vToken = new ethers.Contract(vTUSD_BSC_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0x62A8919C4C413fd4F9aef7348540Bc4B1b5CC805");

      vToken = new ethers.Contract(vUSDT_BSC_DEFI, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0x3aB2e4594D9C81455b330B423Dec61E49EB11667");

      vToken = new ethers.Contract(vUSDT_BSC_GAMEFI, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0x3aB2e4594D9C81455b330B423Dec61E49EB11667");

      vToken = new ethers.Contract(vUSDT_BSC_MEME, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0xDdeb3556b325D5578575c6eF0F855b73D2323E34");

      vToken = new ethers.Contract(vUSDT_BSC_TRON, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals("0x009cdFB248e021f58A34B50dc2A7601EA72d14Ac");
    });

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

  testVip("vip-415", await vip415(), {
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
    it("check IRM address", async () => {
      let vToken = new ethers.Contract(vDAI_BSC_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(BSC_DAI_TUSD_IRM);

      vToken = new ethers.Contract(vTUSD_BSC_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(BSC_DAI_TUSD_IRM);

      vToken = new ethers.Contract(vUSDT_BSC_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(BSC_TWO_KINKS_IRM);

      vToken = new ethers.Contract(vUSDC_BSC_CORE, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(BSC_TWO_KINKS_IRM);

      vToken = new ethers.Contract(vUSDT_BSC_DEFI, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(BSC_USDT_DEFI_GAMEFI_TRON_IRM);

      vToken = new ethers.Contract(vUSDT_BSC_GAMEFI, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(BSC_USDT_DEFI_GAMEFI_TRON_IRM);

      vToken = new ethers.Contract(vUSDT_BSC_MEME, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(BSC_USDT_MEME_IRM);

      vToken = new ethers.Contract(vUSDT_BSC_TRON, VTOKEN_ABI, ethers.provider);
      expect(await vToken.interestRateModel()).to.equals(BSC_USDT_DEFI_GAMEFI_TRON_IRM);
    });

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

    checkInterestRate(BSC_USDT_DEFI_GAMEFI_TRON_IRM, "USDT_DEFI_GAMEFI_CORE", {
      base: "0.02",
      multiplier: "0.2",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate(BSC_USDT_MEME_IRM, "USDT_MEME_CORE", {
      base: "0",
      multiplier: "0.2",
      jump: "2.5",
      kink: "0.8",
    });
  });
});
