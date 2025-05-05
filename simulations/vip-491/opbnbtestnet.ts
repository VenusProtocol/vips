import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip491, { BINANCE_ORACLE, RESILIENT_ORACLE } from "../../vips/vip-491/bsctestnet";
import BINANCE_ORACLE_ABI from "./abi/BinanceOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;
const ONE_YEAR = 365 * 24 * 60 * 60;

forking(62415086, async () => {
  const provider = ethers.provider;

  await impersonateAccount(opbnbtestnet.NORMAL_TIMELOCK);
  await setBalance(opbnbtestnet.NORMAL_TIMELOCK, ethers.utils.parseEther("1000000"));
  const signer = await ethers.getSigner(opbnbtestnet.NORMAL_TIMELOCK);

  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  const binanceOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, signer);

  describe("Pre-VIP behaviour", async () => {
    it("check BTCB price", async () => {
      await binanceOracle.setMaxStalePeriod("BTC", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x7Af23F9eA698E9b953D2BD70671173AaD0347f19")).to.equal(
        parseUnits("94803.7399963", 18),
      );
    });

    it("check ETH price", async () => {
      await binanceOracle.setMaxStalePeriod("ETH", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x94680e003861D43C6c0cf18333972312B6956FF1")).to.equal(
        parseUnits("1821.05454131", 18),
      );
    });

    it("check USDT price", async () => {
      await binanceOracle.setMaxStalePeriod("USDT", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855")).to.equal(
        parseUnits("1.00076", 18),
      );
    });

    it("check WBNB price", async () => {
      await binanceOracle.setMaxStalePeriod("BNB", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("591.81800299", 18),
      );
    });
  });

  testForkedNetworkVipCommands("vip491", await vip491());

  describe("Post-VIP behaviour", async () => {
    it("check BTCB price", async () => {
      await binanceOracle.setMaxStalePeriod("BTC", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x7Af23F9eA698E9b953D2BD70671173AaD0347f19")).to.equal(
        parseUnits("94803.7399963", 18),
      );
    });

    it("check ETH price", async () => {
      await binanceOracle.setMaxStalePeriod("ETH", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x94680e003861D43C6c0cf18333972312B6956FF1")).to.equal(
        parseUnits("1821.05454131", 18),
      );
    });

    it("check USDT price", async () => {
      await binanceOracle.setMaxStalePeriod("USDT", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855")).to.equal(
        parseUnits("1.00076", 18),
      );
    });

    it("check WBNB price", async () => {
      await binanceOracle.setMaxStalePeriod("BNB", ONE_YEAR);
      expect(await resilientOracle.getPrice("0x4200000000000000000000000000000000000006")).to.equal(
        parseUnits("591.81800299", 18),
      );
    });
  });
});
