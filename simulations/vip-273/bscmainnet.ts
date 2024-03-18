import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, setMaxStalePeriodInBinanceOracle } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { BINANCE_ORACLE, vip273 } from "../../vips/vip-273/bscmainnet";
import BINANCE_ORACLE_ABI from "./abi/BinanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const agEUR = "0x12f31B73D812C6Bb0d735a218c086d44D5fe5f89";
const vagEUR = "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F";

forking(37074155, () => {
  let oracle: ethers.Contract;

  before(async () => {
    oracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
    await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "agEUR");
  });

  testVip("VIP-273 Send XVS to Dest Chain", vip273(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["SymbolOverridden"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("getPrice and getUnderlying price should return correct price", async () => {
      const price = await oracle.getPrice(agEUR);
      expect(price).equals(parseUnits("1.08551962", 18));

      const underlyingPrice = await oracle.getUnderlyingPrice(vagEUR);
      expect(underlyingPrice).equals(parseUnits("1.08551962", 18));
    });
  });
});
