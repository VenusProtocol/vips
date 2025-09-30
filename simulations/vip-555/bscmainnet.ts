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
} from "../../vips/vip-555/bscmainnet";
import { CORE_MARKETS } from "../../vips/vip-555/bscmainnet";
import PRIME_ABI from "./abi/Prime.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import ERC20_ABI from "./abi/erc20.json";
import PSR_ABI from "./abi/protocolShareReserve.json";

forking(62885653, async () => {
  let psr: Contract;
  let primeLiquidityProvider: Contract;
  let prime: Contract;
  let usdc: Contract;
  let eth: Contract;
  let usdt: Contract;

  let usdcBalanceInPLP: bigint;
  let ethBalanceInPLP: bigint;
  let usdtBalanceInPLP: bigint;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, PSR);
    primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    eth = await ethers.getContractAt(ERC20_ABI, ETH);
    usdt = await ethers.getContractAt(ERC20_ABI, USDT);

    usdcBalanceInPLP = (await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER)).toBigInt();
    ethBalanceInPLP = (await eth.balanceOf(PRIME_LIQUIDITY_PROVIDER)).toBigInt();
    usdtBalanceInPLP = (await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER)).toBigInt();

    for (const market of CORE_MARKETS) {
      // Call function with default feed = AddressZero (so it fetches from oracle.tokenConfigs)
      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bscmainnet.CHAINLINK_ORACLE,
        market.asset,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );

      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bscmainnet.REDSTONE_ORACLE,
        market.asset,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bscmainnet.NORMAL_TIMELOCK,
        315360000,
      );
    }
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bscmainnet.BINANCE_ORACLE, "WBETH", 315360000);
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bscmainnet.BINANCE_ORACLE, "TWT", 315360000);
    await setMaxStalePeriodInBinanceOracle(NETWORK_ADDRESSES.bscmainnet.BINANCE_ORACLE, "lisUSD", 315360000);
  });

  describe("Pre-VIP state", async () => {
    it("check current distribution configs", async () => {
      expect(await psr.getPercentageDistribution(USDC_PRIME_CONVERTER, 0)).to.equal(600);
      expect(await psr.getPercentageDistribution(USDT_PRIME_CONVERTER, 0)).to.equal(1100);
      expect(await psr.getPercentageDistribution(BTCB_PRIME_CONVERTER, 0)).to.equal(100);
      expect(await psr.getPercentageDistribution(ETH_PRIME_CONVERTER, 0)).to.equal(200);
    });

    it("check balance of USDC, ETH from PrimeLiquidityProvider", async () => {
      expect(await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.gte(parseUnits("13000", 18));
      expect(await eth.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.gte(parseUnits("2", 18));
    });

    it("check current prime reward distribution speeds", async () => {
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDC)).to.equal(18835616438356164n);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDT)).to.equal(34531963470319634n);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(BTCB)).to.equal(38051750380n);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(ETH)).to.equal(3339992389649n);
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

      // setTokensDistributionSpeed for both USDC and USDT
      await expectEvents(txResponse, [PRIME_LIQUIDITY_PROVIDER_ABI], ["TokenDistributionSpeedUpdated"], [2]);

      // updateMultipliers for vUSDC and vUSDT
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
      const usdcBalanceInPLPAfter = (await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER)).toBigInt();
      const ethBalanceInPLPAfter = (await eth.balanceOf(PRIME_LIQUIDITY_PROVIDER)).toBigInt();
      const usdtBalanceInPLPAfter = (await usdt.balanceOf(PRIME_LIQUIDITY_PROVIDER)).toBigInt();

      const usdcConvertedAmt = parseUnits("13000", 18).toBigInt() - (usdcBalanceInPLP - usdcBalanceInPLPAfter);
      const ethConvertedAmt = parseUnits("2", 18).toBigInt() - (ethBalanceInPLP - ethBalanceInPLPAfter);

      const usdtReceivedAmt = usdtBalanceInPLPAfter - usdtBalanceInPLP;

      /// @dev for USDC/ETH->USDT conversion, there are several cases
      /// case 1: USDC/ETH is sweeped but none has been converted to USDT
      /// case 2: USDC/ETH is sweeped but only partially gets converted to USDT
      /// case 3: USDC/ETH is sweeped and gets converted to USDT fully

      /// Hence what do we here is try to calculate the expected amount of USDT received based on the converted amounts of USDC and ETH
      /// The exchange rate is the USDC/ETH price at block 62885653
      expect(usdtReceivedAmt).to.be.closeTo(usdcConvertedAmt + ethConvertedAmt * 4180n, 1000000000000000000n);

      /// @dev Try to share more context
      /// Some might be curious what happens next if no conversion happens due to insufficient balance in converter
      /// They will get converted over time by 3rd integrator
      /// ref: https://www.notion.so/TD-81-Incorporate-Token-converters-into-agregators-13cb4e5771bb8094a887fb866e84a47d#13cb4e5771bb8094a887fb866e84a47d
    });

    it("check current prime reward distribution speeds", async () => {
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDT)).to.equal(parseUnits("0.007", 18));
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDC)).to.equal(parseUnits("0.007", 18));
      /// @dev BTCB, ETH should remain the same
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(BTCB)).to.equal(38051750380n);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(ETH)).to.equal(3339992389649n);
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
