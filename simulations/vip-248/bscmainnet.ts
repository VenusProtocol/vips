import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { BINANCE_ORACLE, vip248 } from "../../vips/vip-248/bscmainnet";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";

forking(35869619, () => {
  const provider = ethers.provider;
  let binanceOracle: ethers.Contract;

  before(async () => {
    binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, provider);
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

    it("Verify Symbol Override of lisUSD", async () => {
      const symbol = await binanceOracle.symbols("lisUSD");
      expect(symbol).equals("");
    });

    it("Verify Symbol Override of slisBNB", async () => {
      const symbol = await binanceOracle.symbols("slisBNB");
      expect(symbol).equals("");
    });
  });

  testVip("VIP-247 Chaos Labs Recommendations", vip248(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["SymbolOverridden", "MaxStalePeriodAdded"], [2, 2]);
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

    it("Verify Symbol Override of lisUSD", async () => {
      const symbol = await binanceOracle.symbols("lisUSD");
      expect(symbol).equals("HAY");
    });

    it("Verify Symbol Override of slisBNB", async () => {
      const symbol = await binanceOracle.symbols("slisBNB");
      expect(symbol).equals("SnBNB");
    });
  });
});
