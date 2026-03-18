import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { CORE_MARKETS, vip600 } from "../../vips/vip-600/bsctestnet";
import COMPTROLLER_ABI from "../vip-567/abi/Comptroller.json";
import VTOKEN_ABI from "../vip-567/abi/VToken.json";

const UNITROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";

forking(96416541, async () => {
  describe("Pre-VIP behavior", () => {
    it("CORE_MARKETS should cover all on-chain markets (minus excluded)", async () => {
      const comptroller = await ethers.getContractAt(COMPTROLLER_ABI, UNITROLLER);
      const allMarkets: string[] = await comptroller.getAllMarkets();
      // vBNB excluded from CORE_MARKETS — native BNB market, does not support setFlashLoanFeeMantissa
      expect(CORE_MARKETS.length).to.equal(allMarkets.length - 1, "CORE_MARKETS does not cover all markets");
    });

    // These markets already have zero fees (deployed after vip-567 with fee defaulting to zero)
    const MARKETS_WITH_ZERO_FEE = ["vE", "vPT-clisBNB-25JUN2026", "vXAUM"];

    it("flash loan fee should be non-zero for markets not already zeroed", async () => {
      for (const market of CORE_MARKETS) {
        if (MARKETS_WITH_ZERO_FEE.includes(market.name)) continue;

        const vToken = await ethers.getContractAt(VTOKEN_ABI, market.address);
        const fee = await vToken.flashLoanFeeMantissa();
        const protocolShare = await vToken.flashLoanProtocolShareMantissa();

        expect(fee).to.be.gt(0, `${market.name} fee is already zero`);
        expect(protocolShare).to.be.gt(0, `${market.name} protocol share is already zero`);
      }
    });
  });

  // 3 markets already have zero fees (vE, vPT-clisBNB-25JUN2026, vXAUM) — no event emitted for those
  testVip("VIP-600 flash loan fee reset", await vip600(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [VTOKEN_ABI], ["FlashLoanFeeUpdated"], [CORE_MARKETS.length - 3]);
    },
  });

  describe("Post-VIP behavior", () => {
    it("flash loan fee and protocol share should be zero for all core markets", async () => {
      for (const market of CORE_MARKETS) {
        const vToken = await ethers.getContractAt(VTOKEN_ABI, market.address);
        const fee = await vToken.flashLoanFeeMantissa();
        const protocolShare = await vToken.flashLoanProtocolShareMantissa();

        expect(fee).to.equal(0, `${market.name} fee not zero`);
        expect(protocolShare).to.equal(0, `${market.name} protocol share not zero`);
      }
    });
  });
});
