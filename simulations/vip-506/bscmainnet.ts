import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkInterestRate, checkTwoKinksInterestRate } from "src/vip-framework/checks/interestRateModel";

import vip506, {
  BNB_vDAI_CORE,
  BNB_vDAI_CORE_IRM,
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
  newRF,
  vBNB,
} from "../../vips/vip-506/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VBEP20_ABI from "./abi/VBep20Abi.json";
import VTOKEN_ABI from "./abi/VToken.json";

const oldIRMs = [
  [BNB_vFDUSD_CORE, "0x717dbabeCc502c8712e7646ab6801F802a997C20"],
  [BNB_vUSDC_CORE, "0x81d6ae3EEa177d5D052B329dc74d39B935569359"],
  [BNB_vDAI_CORE, "0x42Ef8ecCEe0782a4E644B3EB39761fb6c696ccF2"],
  [BNB_vTUSD_CORE, "0x42Ef8ecCEe0782a4E644B3EB39761fb6c696ccF2"],
  [BNB_vUSDT_CORE, "0x81d6ae3EEa177d5D052B329dc74d39B935569359"],
  [BNB_vUSDT_DeFi, "0x9932Bb977b8EF5f5ff7D3780e0A2D430C108a7c4"],
  [BNB_vUSDD_DeFi, "0xD63B54B8d187A0dDca4B9bcDe287923271409fb1"],
  [BNB_vUSDT_GameFi, "0x9932Bb977b8EF5f5ff7D3780e0A2D430C108a7c4"],
  [BNB_vUSDD_GameFi, "0xD63B54B8d187A0dDca4B9bcDe287923271409fb1"],
  [BNB_vUSDT_Meme, "0xfF127d614899895f197fbEf8AF64a9B6540eb8a1"],
  [BNB_vUSDT_Stablecoin, "0xAeD11F0453f59f2ed5533D016AA748Cd0b7108d7"],
  [BNB_vUSDD_Stablecoin, "0xD63B54B8d187A0dDca4B9bcDe287923271409fb1"],
  [BNB_vlisUSD_Stablecoin, "0xA4471c68bB3D3d9301D540552311680F5cC35228"],
  [BNB_vUSDT_Tron, "0x9932Bb977b8EF5f5ff7D3780e0A2D430C108a7c4"],
  [BNB_vUSDD_Tron, "0xD63B54B8d187A0dDca4B9bcDe287923271409fb1"],
];

const newIRMs = [
  [BNB_vFDUSD_CORE, BNB_vFDUSD_CORE_IRM],
  [BNB_vUSDC_CORE, BNB_vUSDC_CORE_IRM],
  [BNB_vDAI_CORE, BNB_vDAI_CORE_IRM],
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
forking(50567390, async () => {
  let vbnb: Contract;

  before(async () => {
    vbnb = new ethers.Contract(vBNB, VTOKEN_ABI, ethers.provider);
  });
  describe("Pre-VIP behaviour", async () => {
    it("check reserve factor", async () => {
      expect(await vbnb.reserveFactorMantissa()).to.equal(ethers.utils.parseUnits("0.1", 18));
    });
    it("check IRM address", async () => {
      for (const [market, expectedModel] of oldIRMs) {
        const marketContract = new ethers.Contract(market, VTOKEN_ABI, ethers.provider);
        expect(await marketContract.interestRateModel()).to.equals(expectedModel);
      }
    });

    checkInterestRate("0x717dbabeCc502c8712e7646ab6801F802a997C20", "FDUSD_CORE", {
      base: "0",
      multiplier: "0.075",
      jump: "5",
      kink: "0.8",
    });

    checkTwoKinksInterestRate("0x81d6ae3EEa177d5D052B329dc74d39B935569359", "USDC_CORE_USDT_CORE", {
      base: "0",
      multiplier: "0.15",
      kink1: "0.8",
      base2: "0",
      multiplier2: "0.9",
      kink2: "0.9",
      jump: "3",
    });

    checkInterestRate("0x42Ef8ecCEe0782a4E644B3EB39761fb6c696ccF2", "DAI_CORE_TUSD_CORE", {
      base: "0",
      multiplier: "0.175",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate("0x9932Bb977b8EF5f5ff7D3780e0A2D430C108a7c4", "USDT_DeFi_USDT_GameFi_USDT_Tron", {
      base: "0.02",
      multiplier: "0.2",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate("0xD63B54B8d187A0dDca4B9bcDe287923271409fb1", "USDD_DeFi_USDD_GameFi_USDD_Stablecoin_USDD_Tron", {
      base: "0.02",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.7",
    });

    checkInterestRate("0xfF127d614899895f197fbEf8AF64a9B6540eb8a1", "USDT_Meme", {
      base: "0",
      multiplier: "0.2",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate("0xAeD11F0453f59f2ed5533D016AA748Cd0b7108d7", "USDT_Stablecoin", {
      base: "0",
      multiplier: "0.0375",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate("0xA4471c68bB3D3d9301D540552311680F5cC35228", "lisUSD_Stablecoin", {
      base: "0.02",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.5",
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
      await expectEvents(txResponse, [VBEP20_ABI], ["NewMarketInterestRateModel", "NewReserveFactor"], [5, 1]);
      await expectEvents(txResponse, [VTOKEN_ABI], ["NewMarketInterestRateModel"], [10]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("check reserve factor", async () => {
      expect(await vbnb.reserveFactorMantissa()).to.equal(newRF);
    });
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
      jump: "5",
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

    checkInterestRate(BNB_vDAI_CORE_IRM, "DAI_CORE", {
      base: "0",
      multiplier: "0.1",
      jump: "2.5",
      kink: "0.8",
    });

    checkInterestRate(BNB_vTUSD_CORE_IRM, "TUSD_CORE", {
      base: "0",
      multiplier: "0.1",
      jump: "2.5",
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
      jump: "2.5",
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
      jump: "2.5",
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
