import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import {
  BTCB,
  BTCB_PRIME_CONVERTER,
  ETH,
  ETH_PRIME_CONVERTER,
  PRIME,
  PRIME_LIQUIDITY_PROVIDER,
  PSR,
  USDC,
  USDC_PRIME_CONVERTER,
  USDT,
  USDT_PRIME_CONVERTER,
  vUSDC,
  vUSDT,
  vip555,
} from "../../vips/vip-555/bsctestnet";
import { CORE_MARKETS } from "../../vips/vip-555/bsctestnet";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import ERC20_ABI from "./abi/erc20.json";
import PSR_ABI from "./abi/protocolShareReserve.json";

forking(67179812, async () => {
  let psr: Contract;
  let primeLiquidityProvider: Contract;
  let prime: Contract;
  let usdc: Contract;
  let eth: Contract;
  let usdt: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, PSR);
    primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    eth = await ethers.getContractAt(ERC20_ABI, ETH);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);

    for (const market of CORE_MARKETS) {
      // Call function with default feed = AddressZero (so it fetches from oracle.tokenConfigs)
      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
        market.asset,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
        315360000,
      );

      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bsctestnet.REDSTONE_ORACLE,
        market.asset,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
        315360000,
      );
    }
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bsctestnet.BINANCE_ORACLE, "WBETH", 315360000);
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bsctestnet.BINANCE_ORACLE, "TWT", 315360000);
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bsctestnet.BINANCE_ORACLE, "lisUSD", 315360000);
  });

  describe("Pre-VIP state", async () => {
    it("check current distribution configs", async () => {
      expect(await psr.getPercentageDistribution(USDC_PRIME_CONVERTER, 0)).to.equal(600);
      expect(await psr.getPercentageDistribution(USDT_PRIME_CONVERTER, 0)).to.equal(1100);
      expect(await psr.getPercentageDistribution(BTCB_PRIME_CONVERTER, 0)).to.equal(100);
      expect(await psr.getPercentageDistribution(ETH_PRIME_CONVERTER, 0)).to.equal(200);
    });

    it("check balance of USDT, USDC, ETH from PrimeLiquidityProvider and USDTPrimeConverter", async () => {
      expect(await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.eq(148146149392433465835078n);
      expect(await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.eq(6800150420); 
      expect(await eth.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.eq(0);

      expect(await usdt.balanceOf(USDT_PRIME_CONVERTER)).to.eq(10000000);
      expect(await usdc.balanceOf(USDT_PRIME_CONVERTER)).to.eq(0); 
      expect(await eth.balanceOf(USDT_PRIME_CONVERTER)).to.eq(0);
    });

    it("check current prime reward distribution speeds", async () => {
      // USDC and USDT are 6 decimals on bsctestnet
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDC)).to.equal(9220);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDT)).to.equal(21797);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(BTCB)).to.equal(315393518518);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(ETH)).to.equal(6109664351851);
    });

    it("check Prime multipliers", async () => {
      const usdcMarket = await prime.markets(vUSDC);
      expect(usdcMarket.supplyMultiplier).to.equal(2000000000000000000n);
      expect(usdcMarket.borrowMultiplier).to.equal(4000000000000000000n);
      const usdtMarket = await prime.markets(vUSDT);
      expect(usdtMarket.supplyMultiplier).to.equal(2000000000000000000n);
      expect(usdtMarket.borrowMultiplier).to.equal(4000000000000000000n);
    });
  });

  testVip("VIP-555", await vip555(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      // percentage distribution updates for those four assets
      await expectEvents(txResponse, [PSR_ABI], ["DistributionConfigUpdated"], [4]);

      // sweep token for USDC and ETH
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["SweepToken"], [2]);

      // setTokensDistributionSpeed for USDT and USDC
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [2]);

      // updateMultipliers for vUSDT and vUSDC
      await expectEvents(txResponse, [PRIME_ABI], ["MultiplierUpdated"], [2]);
    },
  });

  describe("Post-VIP state", async () => {
    it("check current distribution configs", async () => {
      // it should be 10%, 10%, 0%, 0%
      expect(await psr.getPercentageDistribution(USDC_PRIME_CONVERTER, 0)).to.equal(1000);
      expect(await psr.getPercentageDistribution(USDT_PRIME_CONVERTER, 0)).to.equal(1000);
      expect(await psr.getPercentageDistribution(BTCB_PRIME_CONVERTER, 0)).to.equal(0);
      expect(await psr.getPercentageDistribution(ETH_PRIME_CONVERTER, 0)).to.equal(0);
    });

    it("check sweep and token conversion status", async () => {
      // usdt amount increased on PLP as some usdc got converted to usdt
      expect(await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.eq(148146149392433690317587n);
      expect(await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.eq(6024830549); 
      expect(await eth.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.eq(0);

      // some usdc remains as converter network does not enough usdt to swap
      expect(await usdt.balanceOf(USDT_PRIME_CONVERTER)).to.eq(0);
      expect(await usdc.balanceOf(USDT_PRIME_CONVERTER)).to.eq(785319871); 
      expect(await eth.balanceOf(USDT_PRIME_CONVERTER)).to.eq(0);
    });

    it("check current prime reward distribution speeds", async () => {
      /// @dev since USDT is the only asset that has been updated, USDC, BTCB, ETH should remain the same
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDT)).to.equal(7000);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDC)).to.equal(7000);

      expect(await primeLiquidityProvider.tokenDistributionSpeeds(BTCB)).to.equal(315393518518);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(ETH)).to.equal(6109664351851);
    });

    it("check Prime multipliers", async () => {
      const usdcMarket = await prime.markets(vUSDC);
      expect(usdcMarket.supplyMultiplier).to.equal(2000000000000000000n);
      expect(usdcMarket.borrowMultiplier).to.equal(0);
      const usdtMarket = await prime.markets(vUSDT);
      expect(usdtMarket.supplyMultiplier).to.equal(2000000000000000000n);
      expect(usdtMarket.borrowMultiplier).to.equal(0);
    });
  });
});
