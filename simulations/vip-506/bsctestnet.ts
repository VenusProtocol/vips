import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip506, {
  BNB_vFDUSD_CORE,
  BNB_vFDUSD_CORE_IRM,
  BNB_vTUSD_CORE,
  BNB_vTUSD_CORE_IRM,
  BNB_vUSDC_CORE,
  BNB_vUSDC_CORE_IRM,
  BNB_vUSDD_DeFi,
  BNB_vUSDD_DeFi_IRM,
  BNB_vUSDD_GameFi,
  BNB_vUSDD_GameFi_IRM,
  BNB_vUSDD_Stablecoin,
  BNB_vUSDD_Stablecoin_IRM,
  BNB_vUSDD_Tron,
  BNB_vUSDD_Tron_IRM,
  BNB_vUSDT_CORE,
  BNB_vUSDT_CORE_IRM,
  BNB_vUSDT_DeFi,
  BNB_vUSDT_DeFi_IRM,
  BNB_vUSDT_GameFi,
  BNB_vUSDT_GameFi_IRM,
  BNB_vUSDT_Meme,
  BNB_vUSDT_Meme_IRM,
  BNB_vUSDT_Stablecoin,
  BNB_vUSDT_Stablecoin_IRM,
  BNB_vUSDT_Tron,
  BNB_vUSDT_Tron_IRM,
  BNB_vlisUSD_Stablecoin,
  BNB_vlisUSD_Stablecoin_IRM,
} from "../../vips/vip-506/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VTOKEN_ABI from "./abi/VToken.json";

const oldIRMs = [
  [BNB_vFDUSD_CORE, "0x2182450eC9780F17511FeAcE6FC3ED8F774157b3"],
  [BNB_vUSDC_CORE, "0xc8dC4a0a29e2423664556a31349Da3FF26850e8D"],
  [BNB_vTUSD_CORE, "0xdE06A850D42dcff216e1EfCa5358cB167Da247ca"],
  [BNB_vUSDT_CORE, "0xc8dC4a0a29e2423664556a31349Da3FF26850e8D"],
  [BNB_vUSDT_DeFi, "0xfe98c5cC866E67301C986e4daf267ce9970A6b69"],
  [BNB_vUSDD_DeFi, "0xfe98c5cC866E67301C986e4daf267ce9970A6b69"],
  [BNB_vUSDT_GameFi, "0xfe98c5cC866E67301C986e4daf267ce9970A6b69"],
  [BNB_vUSDD_GameFi, "0xfe98c5cC866E67301C986e4daf267ce9970A6b69"],
  [BNB_vUSDT_Meme, "0xa9797E6335f2cb6F5a316B4AE3FaC36038697196"],
  [BNB_vUSDT_Stablecoin, "0x8Eb46681EF0D3d13a911C8b8556aA1A3819304eE"],
  [BNB_vUSDD_Stablecoin, "0x372491CB9525b81E4fC9400abec86912998b7F87"],
  [BNB_vlisUSD_Stablecoin, "0x372491CB9525b81E4fC9400abec86912998b7F87"],
  [BNB_vUSDT_Tron, "0xfe98c5cC866E67301C986e4daf267ce9970A6b69"],
  [BNB_vUSDD_Tron, "0xfe98c5cC866E67301C986e4daf267ce9970A6b69"],
];

const newIRMs = [
  [BNB_vFDUSD_CORE, BNB_vFDUSD_CORE_IRM],
  [BNB_vUSDC_CORE, BNB_vUSDC_CORE_IRM],
  [BNB_vTUSD_CORE, BNB_vTUSD_CORE_IRM],
  [BNB_vUSDT_CORE, BNB_vUSDT_CORE_IRM],
  [BNB_vUSDT_DeFi, BNB_vUSDT_DeFi_IRM],
  [BNB_vUSDD_DeFi, BNB_vUSDD_DeFi_IRM],
  [BNB_vUSDT_GameFi, BNB_vUSDT_GameFi_IRM],
  [BNB_vUSDD_GameFi, BNB_vUSDD_GameFi_IRM],
  [BNB_vUSDT_Meme, BNB_vUSDT_Meme_IRM],
  [BNB_vUSDD_Stablecoin, BNB_vUSDD_Stablecoin_IRM],
  [BNB_vUSDT_Stablecoin, BNB_vUSDT_Stablecoin_IRM],
  [BNB_vlisUSD_Stablecoin, BNB_vlisUSD_Stablecoin_IRM],
  [BNB_vUSDD_Tron, BNB_vUSDD_Tron_IRM],
  [BNB_vUSDT_Tron, BNB_vUSDT_Tron_IRM],
];

forking(52603412, async () => {
  describe("Pre-VIP behaviour", async () => {
    it("check IRM address", async () => {
      for (const [market, expectedModel] of oldIRMs) {
        const marketContract = new ethers.Contract(market, VTOKEN_ABI, ethers.provider);
        expect(await marketContract.interestRateModel()).to.equals(expectedModel);
      }
    });

    checkInterestRate("0x2182450eC9780F17511FeAcE6FC3ED8F774157b3", "FDUSD_CORE", {
      base: "0",
      multiplier: "0.06875",
      jump: "2.5",
      kink: "0.8",
    });

    // this is CheckpointView Contract
    checkInterestRate("0xc8dC4a0a29e2423664556a31349Da3FF26850e8D", "USDC_CORE_USDT_CORE", {
      base: "0.02",
      multiplier: "0.1",
    });

    checkInterestRate("0xdE06A850D42dcff216e1EfCa5358cB167Da247ca", "TUSD_CORE", {
      base: "0",
      multiplier: "0.05",
      jump: "1.09",
      kink: "0.8",
    });

    checkInterestRate("0xfe98c5cC866E67301C986e4daf267ce9970A6b69", "USDT_DeFi_USDD_DeFi_USDT_GameFi_USDD_GameFi", {
      base: "0.03",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.6",
    });

    checkInterestRate("0xa9797E6335f2cb6F5a316B4AE3FaC36038697196", "USDT_Meme", {
      base: "0",
      multiplier: "0.175",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate("0x8Eb46681EF0D3d13a911C8b8556aA1A3819304eE", "USDT_Stablecoin", {
      base: "0.02",
      multiplier: "0.083333333333333333",
      jump: "2.5",
      kink: "0.6",
    });

    checkInterestRate("0x372491CB9525b81E4fC9400abec86912998b7F87", "USDD_Stablecoin_lisUSD_Stablecoin", {
      base: "0.02",
      multiplier: "0.125",
      jump: "3",
      kink: "0.8",
    });
  });

  testVip("vip-506", await vip506(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [6, 0],
      );
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [10]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check IRM address", async () => {
      for (const [market, expectedIRM] of newIRMs) {
        const marketContract = new ethers.Contract(market, VTOKEN_ABI, ethers.provider);
        expect(await marketContract.interestRateModel()).to.equals(expectedIRM);
      }
    });

    checkInterestRate(BNB_vFDUSD_CORE_IRM, "FDUSD_CORE", {
      base: "0",
      multiplier: "0.1",
      kink: "0.8",
      jump: "2.5",
    });

    checkTwoKinksInterestRate(BNB_vUSDC_CORE_IRM, "USDC_CORE", {
      base: "0",
      multiplier: "0.1",
      kink1: "0.8",
      multiplier2: "0.7",
      base2: "0",
      kink2: "0.9",
      jump: "3",
    });

    checkInterestRate(BNB_vTUSD_CORE_IRM, "TUSD_CORE", {
      base: "0",
      multiplier: "0.1",
      jump: "1.09",
      kink: "0.8",
    });

    checkTwoKinksInterestRate(BNB_vUSDT_CORE_IRM, "USDT_CORE", {
      base: "0",
      multiplier: "0.1",
      kink1: "0.8",
      multiplier2: "0.7",
      base2: "0",
      kink2: "0.9",
      jump: "3",
    });

    checkInterestRate(BNB_vUSDT_DeFi_IRM, "USDT_DeFi", {
      base: "0.02",
      multiplier: "0.1",
      kink: "0.8",
      jump: "2.5",
    });

    checkInterestRate(BNB_vUSDD_DeFi_IRM, "USDD_DeFi", {
      base: "0.02",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.7",
    });

    checkInterestRate(BNB_vUSDT_GameFi_IRM, "USDT_GameFi", {
      base: "0.02",
      multiplier: "0.1",
      kink: "0.8",
      jump: "2.5",
    });

    checkInterestRate(BNB_vUSDD_GameFi_IRM, "USDD_GameFi", {
      base: "0.02",
      multiplier: "0.1",
      kink: "0.7",
      jump: "2.5",
    });

    checkInterestRate(BNB_vUSDT_Meme_IRM, "USDT_Meme", {
      base: "0",
      multiplier: "0.1",
      kink: "0.8",
      jump: "2.5",
    });

    checkInterestRate(BNB_vUSDD_Stablecoin_IRM, "USDD_Stablecoin", {
      base: "0.02",
      multiplier: "0.1",
      jump: "3",
      kink: "0.7",
    });

    checkInterestRate(BNB_vUSDT_Stablecoin_IRM, "USDT_Stablecoin", {
      base: "0",
      multiplier: "0.1",
      kink: "0.8",
      jump: "2.5",
    });

    checkInterestRate(BNB_vlisUSD_Stablecoin_IRM, "lisUSD_Stablecoin", {
      base: "0.02",
      multiplier: "0.1",
      kink: "0.5",
      jump: "3",
    });

    checkInterestRate(BNB_vUSDD_Tron_IRM, "USDD_Tron", {
      base: "0.02",
      multiplier: "0.1",
      kink: "0.7",
      jump: "2.5",
    });

    checkInterestRate(BNB_vUSDT_Tron_IRM, "USDT_Tron", {
      base: "0.02",
      multiplier: "0.1",
      kink: "0.8",
      jump: "2.5",
    });
  });
});
