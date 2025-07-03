import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip495, { BINANCE_ORACLE, RESILIENT_ORACLE } from "../../vips/vip-495/bscmainnet";
import BINANCE_ORACLE_ABI from "./abi/BinanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;
const ONE_YEAR = 365 * 24 * 60 * 60;

forking(57121037, async () => {
  const provider = ethers.provider;

  await impersonateAccount(opbnbmainnet.NORMAL_TIMELOCK);
  await setBalance(opbnbmainnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const signer = await ethers.getSigner(opbnbmainnet.NORMAL_TIMELOCK);

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, signer);

  describe("Pre-VIP behaviour", async () => {
    it("check BTCB price", async () => {
      expect(await resilientOracle.getPrice("0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2")).to.equal(
        parseUnits("104509.36995214", 18),
      );
    });

    it("check ETH price", async () => {
      expect(await resilientOracle.getPrice("0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea")).to.equal(
        parseUnits("2571.35747218", 18),
      );
    });

    it("check FDUSD price", async () => {
      expect(await resilientOracle.getPrice("0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb")).to.equal(
        parseUnits("0.99861492", 18),
      );
    });

    it("check USDT price", async () => {
      expect(await resilientOracle.getPrice("0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3")).to.equal(
        parseUnits("1.00022666", 18),
      );
    });

    it("check WBNB price", async () => {
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("670.56868229", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip495", await vip495());

  describe("Post-VIP behaviour", async () => {
    it("check BTCB price", async () => {
      await binanceOracle.setMaxStalePeriod("BTC", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2")).to.equal(
        parseUnits("104509.36995214", 18),
      );
    });

    it("check ETH price", async () => {
      await binanceOracle.setMaxStalePeriod("ETH", ONE_YEAR);
      expect(await resilientOracle.getPrice("0xE7798f023fC62146e8Aa1b36Da45fb70855a77Ea")).to.equal(
        parseUnits("2571.35747218", 18),
      );
    });

    it("check FDUSD price", async () => {
      await binanceOracle.setMaxStalePeriod("FDUSD", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb")).to.equal(
        parseUnits("0.99861492", 18),
      );
    });

    it("check USDT price", async () => {
      await binanceOracle.setMaxStalePeriod("USDT", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x9e5AAC1Ba1a2e6aEd6b32689DFcF62A509Ca96f3")).to.equal(
        parseUnits("1.00022666", 18),
      );
    });

    it("check WBNB price", async () => {
      await binanceOracle.setMaxStalePeriod("BNB", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("670.56868229", 18),
      );
    });
  });
});
