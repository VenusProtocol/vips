import { expect } from "chai";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { BNB, vip500 } from "../../vips/vip-500/bscmainnet";
import BINANCE_ORACLE_ABI from "./abi/BinanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const CHAINLINK_BNB_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
const REDSTONE_BNB_FEED = "0xa51738d1937FFc553d5070f43300B385AA2D9F55";

forking(49136338, async () => {
  const provider = ethers.provider;
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const binanceOracle = new ethers.Contract(bscmainnet.BINANCE_ORACLE, BINANCE_ORACLE_ABI, provider);
  const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, RESILIENT_ORACLE_ABI, provider);

  describe("Pre-VIP behavior", async () => {
    it("get price from main oracle", async () => {
      const bnbPrice = await resilientOracle.getPrice(BNB);

      const bnbPriceRedstone = await redstoneOracle.getPrice(BNB);

      expect(bnbPrice).to.eq(bnbPriceRedstone);
    });

    it("get price from binance oracle", async () => {
      await expect(binanceOracle.getPrice(BNB)).to.be.reverted;
    });
  });

  testVip("VIP-500", await vip500(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [RESILIENT_ORACLE_ABI], ["TokenConfigAdded"], [1]);

      await expectEvents(txResponse, [BINANCE_ORACLE_ABI], ["MaxStalePeriodAdded"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    const expectedBNBPriceFromBinance = "595416957600000000000";

    it("use fallback price when main oracle fails", async () => {
      // PIVOT - Chainlink - It will work
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        BNB,
        CHAINLINK_BNB_FEED,
        bscmainnet.NORMAL_TIMELOCK,
      );

      // MAIN - RedStone - It will fail, because maxStalePeriod is set to 1 second
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.REDSTONE_ORACLE,
        BNB,
        REDSTONE_BNB_FEED,
        bscmainnet.NORMAL_TIMELOCK,
        1,
      );

      // FALLBACK - Binance - It will work
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");

      const bnbPrice = await resilientOracle.getPrice(BNB);

      expect(bnbPrice).to.eq(expectedBNBPriceFromBinance);
    });

    it("get price from binance oracle", async () => {
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");

      const bnbPrice = await binanceOracle.getPrice(BNB);

      expect(bnbPrice).to.eq(expectedBNBPriceFromBinance);
    });
  });
});
