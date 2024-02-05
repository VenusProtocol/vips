import { TransactionResponse } from "@ethersproject/providers";
import { impersonateAccount } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import { BINANCE_ORACLE, NORMAL_TIMELOCK, vip248 } from "../../vips/vip-248/bscmainnet";
import ERC20_ABI from "./abi/IERC20UpgradableAbi.json";
import ACM_ABI from "./abi/acm.json";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const vSnBNB = "0xd3CC9d8f3689B83c91b7B59cAB4946B063EB894A";
const vHAY = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";

forking(35869619, () => {
  const provider = ethers.provider;
  let binanceOracle: ethers.Contract;
  let resilientOracle: ethers.Contract;

  before(async () => {
    impersonateAccount(NORMAL_TIMELOCK);

    binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, await ethers.getSigner(NORMAL_TIMELOCK));
    resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);

    binanceOracle.setMaxStalePeriod("HAY", "31536000");
    binanceOracle.setMaxStalePeriod("SnBNB", "31536000");
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
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [6]);
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

    it("Check Prices", async () => {
      const priceSnBNB = await resilientOracle.getUnderlyingPrice(vHAY);
      expect(priceSnBNB).equals("1002184030000000000");

      const priceHAY = await resilientOracle.getUnderlyingPrice(vSnBNB);
      expect(priceHAY).equals("304064425310000000000");
    });
  });
});
