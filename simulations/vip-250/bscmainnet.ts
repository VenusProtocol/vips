import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { BINANCE_ORACLE, CRITICAL_TIMELOCK, RESILIENT_ORACLE, vip250 } from "../../vips/vip-250/bscmainnet";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const vSnBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const vHAY = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";

forking(35893074, () => {
  const provider = ethers.provider;
  let binanceOracle: Contract;
  let resilientOracle: Contract;

  before(async () => {
    await impersonateAccount(CRITICAL_TIMELOCK);

    binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, await ethers.getSigner(CRITICAL_TIMELOCK));
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify Max Stale Period of lisUSD", async () => {
      const maxStalePeriod = await binanceOracle.maxStalePeriod("lisUSD");
      expect(maxStalePeriod).equals(0);
    });

    it("Verify Max Stale Period of slisBNB", async () => {
      const maxStalePeriod = await binanceOracle.maxStalePeriod("slisBNB");
      expect(maxStalePeriod).equals(0);
    });
  });

  testVip("VIP-250 Rebrand of HAY and SnBNB to lisUSD and slisBNB", vip250(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["MaxStalePeriodAdded"], [2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify Max Stale Period of lisUSD", async () => {
      const maxStalePeriod = await binanceOracle.maxStalePeriod("lisUSD");
      expect(maxStalePeriod).equals(1500);
    });

    it("Verify Max Stale Period of slisBNB", async () => {
      const maxStalePeriod = await binanceOracle.maxStalePeriod("slisBNB");
      expect(maxStalePeriod).equals(1500);
    });

    it("Check Prices", async () => {
      await binanceOracle.setMaxStalePeriod("lisUSD", "31536000");
      await binanceOracle.setMaxStalePeriod("slisBNB", "31536000");

      const priceHAY = await resilientOracle.getUnderlyingPrice(vHAY);
      expect(priceHAY).equals("998604400000000000");

      const priceSnBNB = await resilientOracle.getUnderlyingPrice(vSnBNB);
      expect(priceSnBNB).equals("301444567650000000000");
    });
  });
});
