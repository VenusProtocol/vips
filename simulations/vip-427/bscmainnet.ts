import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  setMaxStalePeriod,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { BNB, BTCB, vip427 } from "../../vips/vip-427/bscmainnet";
import BINANCE_ORACLE_ABI from "./abi/BinanceOracle.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const CHAINLINK_BTC_FEED = "0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf";

forking(45959640, async () => {
  const provider = ethers.provider;
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const binanceOracle = new ethers.Contract(bscmainnet.BINANCE_ORACLE, BINANCE_ORACLE_ABI, provider);
  const bnb = new ethers.Contract(BNB, ERC20_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("get price from resilient oracle", async () => {
      const btcPrice = await resilientOracle.getPrice(BTCB);
      const bnbPrice = await resilientOracle.getPrice(BNB);

      expect(btcPrice).to.eq("103795629920000000000000");
      expect(bnbPrice).to.eq("688818807240000000000");
    });

    it("get price from binance oracle", async () => {
      await expect(binanceOracle.getPrice(BTCB)).to.be.reverted;
      await expect(binanceOracle.getPrice(BNB)).to.be.reverted;
    });
  });

  testVip("VIP-424", await vip427(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [2]);

      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["SymbolOverridden", "MaxStalePeriodAdded"], [1, 2]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("get price from resilient oracle", async () => {
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        BTCB,
        CHAINLINK_BTC_FEED,
        bscmainnet.NORMAL_TIMELOCK,
      );

      await setMaxStalePeriod(resilientOracle, bnb);
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BTC");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");

      const btcPrice = await resilientOracle.getPrice(BTCB);
      const bnbPrice = await resilientOracle.getPrice(BNB);

      expect(btcPrice).to.eq("103778122138560000000000");
      expect(bnbPrice).to.eq("688818807240000000000");
    });

    it("get price from binance oracle", async () => {
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BTC");
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");

      const btcPrice = await binanceOracle.getPrice(BTCB);
      const bnbPrice = await binanceOracle.getPrice(BNB);

      expect(btcPrice).to.eq("103778122138560000000000");
      expect(bnbPrice).to.eq("688760890800000000000");
    });
  });
});
