import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../src/utils";
import { NORMAL_TIMELOCK, forking, testVip } from "../../src/vip-framework";
import { vip274 } from "../../vips/vip-274/bscmainnet";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const vagEUR = "0x795DE779Be00Ea46eA97a28BDD38d9ED570BCF0F";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";

forking(37062000, async () => {
  const provider = ethers.provider;
  let binanceOracle: Contract;
  let resilientOracle: Contract;

  before(async () => {
    await impersonateAccount(CRITICAL_TIMELOCK);

    binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, await ethers.getSigner(CRITICAL_TIMELOCK));
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  });

  describe("Pre-VIP behavior", () => {
    it("Verify Max Stale Period of EURA", async () => {
      const maxStalePeriod = await binanceOracle.maxStalePeriod("EURA");
      expect(maxStalePeriod).equals(0);
    });
  });

  testVip("VIP-274", await vip274(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["SymbolOverridden"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Verify symbol override", async () => {
      const override = await binanceOracle.symbols("EURA");
      expect(override).equals("AGEUR");
    });

    it("Check Prices", async () => {
      const timelock = await initMainnetUser(NORMAL_TIMELOCK, parseEther("1"));
      await binanceOracle.connect(timelock).setMaxStalePeriod("AGEUR", "10000000");

      const priceEURA = await resilientOracle.getUnderlyingPrice(vagEUR);
      expect(priceEURA).equals("1086015180000000000");
    });
  });
});
