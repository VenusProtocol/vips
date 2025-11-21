import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriod, setMaxStalePeriodInBinanceOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip569, { ETH, SolvBTC, USDC, USDT } from "../../vips/vip-569/bscmainnet";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import ERC20_ABI from "./abi/erc20.json";
import REDSTONE_ORACLE_ABI from "./abi/redstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const provider = ethers.provider;

const { bscmainnet } = NETWORK_ADDRESSES;

forking(68957096, async () => {
  let resilientOracle: Contract;

  before(async () => {
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check ETH price", async () => {
      const price = await resilientOracle.getPrice(ETH);
      expect(price).to.be.equal(parseUnits("2682.0408085", 18));
    });

    it("check USDC price", async () => {
      const price = await resilientOracle.getPrice(USDC);
      expect(price).to.be.equal(parseUnits("0.99974845", 18));
    });

    it("check USDT price", async () => {
      const price = await resilientOracle.getPrice(USDT);
      expect(price).to.be.equal(parseUnits("0.99869", 18));
    });

    it("check SolvBTC price", async () => {
      const price = await resilientOracle.getPrice(SolvBTC);
      expect(price).to.be.equal(parseUnits("82288.38515425", 18));
    });
  });

  testVip("VIP-569 bscmainnet", await vip569(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [RESILIENT_ORACLE_ABI, BINANCE_ORACLE_ABI, REDSTONE_ORACLE_ABI, BOUND_VALIDATOR_ABI],
        ["TokenConfigAdded", "MaxStalePeriodAdded", "TokenConfigAdded", "ValidateConfigAdded"],
        [8, 4, 8, 4],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      const eth = await new ethers.Contract(ETH, ERC20_ABI, provider);
      const usdc = await new ethers.Contract(USDC, ERC20_ABI, provider);
      const usdt = await new ethers.Contract(USDT, ERC20_ABI, provider);
      const solvbtc = await new ethers.Contract(SolvBTC, ERC20_ABI, provider);

      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "ETH");

      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "USDC");

      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "USDT");

      await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "SolvBTC");

      await setMaxStalePeriod(resilientOracle, eth);
      await setMaxStalePeriod(resilientOracle, usdc);
      await setMaxStalePeriod(resilientOracle, usdt);
      await setMaxStalePeriod(resilientOracle, solvbtc);
    });
    it("check ETH price", async () => {
      const price = await resilientOracle.getPrice(ETH);
      expect(price).to.be.equal(parseUnits("2682.0408085", 18));
    });

    it("check USDC price", async () => {
      const price = await resilientOracle.getPrice(USDC);
      expect(price).to.be.equal(parseUnits("0.99974845", 18));
    });

    it("check USDT price", async () => {
      const price = await resilientOracle.getPrice(USDT);
      expect(price).to.be.equal(parseUnits("0.99869", 18));
    });

    it("check SolvBTC price", async () => {
      const price = await resilientOracle.getPrice(SolvBTC);
      expect(price).to.be.equal(parseUnits("82279.6314825", 18));
    });
  });
});
