import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, setMaxStalePeriodInBinanceOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { BINANCE_ORACLE, VTOKEN_BEACON, VTOKEN_IMPL, vagEUR, vip278 } from "../../vips/vip-278/bscmainnet";
import BEACON_ABI from "./abi/Beacon.json";
import BINANCE_ORACLE_ABI from "./abi/BinanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import TEMP_VTOKEN_ABI from "./abi/TempVToken.json";

const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";

forking(37477280, async () => {
  const provider = ethers.provider;
  let binanceOracle: Contract;
  let resilientOracle: Contract;
  let vagEURContract: Contract;
  let beacon: Contract;

  before(async () => {
    binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    vagEURContract = new ethers.Contract(vagEUR, TEMP_VTOKEN_ABI, provider);
    beacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify Max Stale Period", async () => {
      const maxStalePeriod = await binanceOracle.maxStalePeriod("EURA");
      expect(maxStalePeriod).equals(0);
    });

    it("Verify Name and Symbol", async () => {
      const name = await vagEURContract.name();
      expect(name).equals("Venus agEUR (Stablecoins)");

      const symbol = await vagEURContract.symbol();
      expect(symbol).equals("vagEUR_Stablecoins");
    });

    it("Verify symbol override", async () => {
      const symbolOverride = await binanceOracle.symbols("EURA");
      expect(symbolOverride).equals("AGEUR");
    });

    it("check implementation", async () => {
      const implementation = await beacon.implementation();
      expect(implementation).equals(VTOKEN_IMPL);
    });
  });

  testVip("VIP-278", await vip278(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["MaxStalePeriodAdded", "SymbolOverridden"], [1, 1]);
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [2]);
      await expectEvents(txResponse, [TEMP_VTOKEN_ABI], ["NameUpdated", "SymbolUpdated"], [1, 1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify Max Stale Period", async () => {
      const maxStalePeriod = await binanceOracle.maxStalePeriod("EURA");
      expect(maxStalePeriod).equals(1500);
    });

    it("Verify Name and Symbol", async () => {
      const name = await vagEURContract.name();
      expect(name).equals("Venus EURA (Stablecoins)");

      const symbol = await vagEURContract.symbol();
      expect(symbol).equals("vEURA_Stablecoins");
    });

    it("Check Prices", async () => {
      await setMaxStalePeriodInBinanceOracle(BINANCE_ORACLE, "EURA");

      const priceagEUR = await resilientOracle.getUnderlyingPrice(vagEUR);
      expect(priceagEUR).equals(parseUnits("1.07588921", 18));
    });

    it("Verify symbol override", async () => {
      const symbolOverride = await binanceOracle.symbols("EURA");
      expect(symbolOverride).equals("");
    });

    it("check implementation", async () => {
      const implementation = await beacon.implementation();
      expect(implementation).equals(VTOKEN_IMPL);
    });
  });
});
