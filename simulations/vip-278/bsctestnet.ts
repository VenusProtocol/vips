import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents, setMaxStalePeriodInBinanceOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { BINANCE_ORACLE, VTOKEN_BEACON, VTOKEN_IMPL, vagEUR, vip278 } from "../../vips/vip-278/bsctestnet";
import BEACON_ABI from "./abi/Beacon.json";
import BINANCE_ORACLE_ABI from "./abi/BinanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import TEMP_VTOKEN_ABI from "./abi/TempVToken.json";

const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";

forking(38683734, async () => {
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

    it("check implementation", async () => {
      const implementation = await beacon.implementation();
      expect(implementation).equals(VTOKEN_IMPL);
    });
  });

  testVip("VIP-278", await vip278(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["MaxStalePeriodAdded"], [1]);
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
      expect(priceagEUR).equals(parseUnits("1.06", 18));
    });

    it("check implementation", async () => {
      const implementation = await beacon.implementation();
      expect(implementation).equals(VTOKEN_IMPL);
    });
  });
});
