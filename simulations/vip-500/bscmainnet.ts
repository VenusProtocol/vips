import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  initMainnetUser,
  setMaxStalePeriodInBinanceOracle,
  setMaxStalePeriodInChainlinkOracle,
} from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { BNB, vip500 } from "../../vips/vip-500/bscmainnet";
import BINANCE_ORACLE_ABI from "./abi/BinanceOracle.json";
import CHAINLINK_ORACLE_ABI from "./abi/ChainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const CHAINLINK_BNB_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
const REDSTONE_BNB_FEED = "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e";

forking(49136338, async () => {
  const provider = ethers.provider;
  const resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const binanceOracle = new ethers.Contract(bscmainnet.BINANCE_ORACLE, BINANCE_ORACLE_ABI, provider);
  const redstoneOracle = new ethers.Contract(bscmainnet.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);

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
    const expectedBNBPriceFromBinance = parseUnits("595.4169576", 18);
    const expectedBNBPriceFromRedStone = parseUnits("594.8268963", 18);

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

    it("use main price when pivot oracle fails", async () => {
      // PIVOT - Chainlink - It will fail, because maxStalePeriod is set to 1 second
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        BNB,
        CHAINLINK_BNB_FEED,
        bscmainnet.NORMAL_TIMELOCK,
        1,
      );

      // MAIN - RedStone - It will work
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.REDSTONE_ORACLE,
        BNB,
        REDSTONE_BNB_FEED,
        bscmainnet.NORMAL_TIMELOCK,
      );

      // FALLBACK - Binance - It will work
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");

      const bnbPrice = await resilientOracle.getPrice(BNB);

      expect(bnbPrice).to.eq(expectedBNBPriceFromRedStone);
    });

    it("use main price when fallback oracle fails", async () => {
      // PIVOT - Chainlink - It will work
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        BNB,
        CHAINLINK_BNB_FEED,
        bscmainnet.NORMAL_TIMELOCK,
      );

      // MAIN - RedStone - It will work
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.REDSTONE_ORACLE,
        BNB,
        REDSTONE_BNB_FEED,
        bscmainnet.NORMAL_TIMELOCK,
      );

      // FALLBACK - Binance - It will fail, because maxStalePeriod is set to 1 second
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB", 1);

      const bnbPrice = await resilientOracle.getPrice(BNB);

      expect(bnbPrice).to.eq(expectedBNBPriceFromRedStone);
    });

    it("use fallback price when main oracle price is too different", async () => {
      // PIVOT - Chainlink - It will work
      await setMaxStalePeriodInChainlinkOracle(
        bscmainnet.CHAINLINK_ORACLE,
        BNB,
        CHAINLINK_BNB_FEED,
        bscmainnet.NORMAL_TIMELOCK,
      );

      // MAIN - RedStone - It will work, but returning a very low price
      const impersonatedTimelock = await initMainnetUser(bscmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
      await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(BNB, expectedBNBPriceFromRedStone.div(2));

      // FALLBACK - Binance - It will work
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");

      const bnbPrice = await resilientOracle.getPrice(BNB);

      expect(bnbPrice).to.eq(expectedBNBPriceFromBinance);

      // Tear down - restoring price configuration on RedStoneOracle
      await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(BNB, 0);
    });

    it("get price from binance oracle", async () => {
      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");

      const bnbPrice = await binanceOracle.getPrice(BNB);

      expect(bnbPrice).to.eq(expectedBNBPriceFromBinance);
    });
  });
});
