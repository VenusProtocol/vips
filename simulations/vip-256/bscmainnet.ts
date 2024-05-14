import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { BINANCE_ORACLE, NORMAL_TIMELOCK, RESILIENT_ORACLE, vHAY, vSnBNB, vip256 } from "../../vips/vip-256/bscmainnet";
import ACM_ABI from "./abi/acm.json";
import BEACON_ABI from "./abi/beacon.json";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import TEMP_VTOKEN_ABI from "./abi/tempVToken.json";

forking(35926690, async () => {
  const provider = ethers.provider;
  let binanceOracle: Contract;
  let resilientOracle: Contract;
  let vHay: Contract;
  let vSnbnb: Contract;

  before(async () => {
    await impersonateAccount(NORMAL_TIMELOCK);

    binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    vHay = new ethers.Contract(vHAY, TEMP_VTOKEN_ABI, provider);
    vSnbnb = new ethers.Contract(vSnBNB, TEMP_VTOKEN_ABI, provider);
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

    it("Verify Name and Symbol", async () => {
      const name = await vHay.name();
      expect(name).equals("Venus HAY (Stablecoins)");

      const symbol = await vHay.symbol();
      expect(symbol).equals("vHAY_Stablecoins");

      const nameSnbnb = await vSnbnb.name();
      expect(nameSnbnb).equals("Venus SnBNB (Liquid Staked BNB)");

      const symbolSnbnb = await vSnbnb.symbol();
      expect(symbolSnbnb).equals("vSnBNB_LiquidStakedBNB");
    });
  });

  testVip("VIP-256 Rebrand of VTokens for HAY and SnBNB", await vip256(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["MaxStalePeriodAdded"], [2]);
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [6]);
      await expectEvents(txResponse, [BEACON_ABI], ["Upgraded"], [2]);
      await expectEvents(txResponse, [TEMP_VTOKEN_ABI], ["NameUpdated", "SymbolUpdated"], [2, 2]);
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

    it("Verify Name and Symbol", async () => {
      const name = await vHay.name();
      expect(name).equals("Venus lisUSD (Stablecoins)");

      const symbol = await vHay.symbol();
      expect(symbol).equals("vlisUSD_Stablecoins");

      const nameSnbnb = await vSnbnb.name();
      expect(nameSnbnb).equals("Venus slisBNB (Liquid Staked BNB)");

      const symbolSnbnb = await vSnbnb.symbol();
      expect(symbolSnbnb).equals("vslisBNB_LiquidStakedBNB");
    });

    it("Check Prices", async () => {
      await binanceOracle.setMaxStalePeriod("lisUSD", "31536000");
      await binanceOracle.setMaxStalePeriod("slisBNB", "31536000");

      const priceHAY = await resilientOracle.getUnderlyingPrice(vHAY);
      expect(priceHAY).equals("998606210000000000");

      const priceSnBNB = await resilientOracle.getUnderlyingPrice(vSnBNB);
      expect(priceSnBNB).equals("303298104890000000000");
    });
  });
});
