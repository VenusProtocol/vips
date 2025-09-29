import { TransactionResponse } from "@ethersproject/providers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";
import { PSR, USDC_PRIME_CONVERTER, USDT_PRIME_CONVERTER, BTCB_PRIME_CONVERTER, ETH_PRIME_CONVERTER, PRIME_LIQUIDITY_PROVIDER, USDC, ETH, PRIME, USDT, BTCB, vUSDC, vUSDT, vip555 } from "../../vips/vip-555/bsctestnet";
import PSR_ABI from "./abi/protocolShareReserve.json";
import PRIME_LIQUIDITY_PROVIDER_ABI from "./abi/PrimeLiquidityProvider.json";
import PRIME_ABI from "./abi/Prime.json";
import ERC20_ABI from "./abi/ERC20.json";


forking(67025822, async () => {
  let psr: Contract;
  let primeLiquidityProvider: Contract;
  let prime: Contract;
  let usdc: Contract;
  let eth: Contract;

  before(async () => {
    psr = await ethers.getContractAt(PSR_ABI, PSR);
    primeLiquidityProvider = await ethers.getContractAt(PRIME_LIQUIDITY_PROVIDER_ABI, PRIME_LIQUIDITY_PROVIDER);
    prime = await ethers.getContractAt(PRIME_ABI, PRIME);
    usdc = await ethers.getContractAt(ERC20_ABI, USDC);
    eth = await ethers.getContractAt(ERC20_ABI, ETH);
  });

  describe("Pre-VIP state", async () => {
    it("check current distribution configs", async () => {
      expect(await psr.getPercentageDistribution(USDC_PRIME_CONVERTER, 0)).to.equal(600);
      expect(await psr.getPercentageDistribution(USDT_PRIME_CONVERTER, 0)).to.equal(1100);
      expect(await psr.getPercentageDistribution(BTCB_PRIME_CONVERTER, 0)).to.equal(100);
      expect(await psr.getPercentageDistribution(ETH_PRIME_CONVERTER, 0)).to.equal(200);
    });


    it("check balance of USDC, ETH from PrimeLiquidityProvider", async () => {
      // USDC on bsctestnet is 6 decimals and only 1800 USDC is available
      // also there is no ETH hence we skip it
      expect(await usdc.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.gte(parseUnits("1000", 6));
      // expect(await eth.balanceOf(PRIME_LIQUIDITY_PROVIDER)).to.gte(parseUnits("2", 18));
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
      // expect events etc...
      // const totalMarkets = CORE_MARKETS.length;
      // const toatlBAMarkets = MARKETS_BA.length;
      // await expectEvents(
      //   txResponse,
      //   [UNITROLLER_ABI, DIAMOND_ABI, LIQUIDATOR_ABI, ACM_ABI],
      //   [
      //     "NewPendingImplementation",
      //     "DiamondCut",
      //     "NewLiquidationTreasuryPercent",
      //     "PermissionGranted",
      //     "PermissionRevoked",
      //   ],
      //   [4, 1, 1, 29, 9],
      // );
      // await expectEvents(txResponse, [VBEP20_DELEGATOR_ABI], ["NewImplementation"], [totalMarkets + 1]); // +2 for unitroller and VAI, -1 for vBNB
      // await expectEvents(
      //   txResponse,
      //   [COMPTROLLER_ABI],
      //   ["NewLiquidationThreshold", "NewLiquidationIncentive", "BorrowAllowedUpdated"],
      //   [totalMarkets - 3, totalMarkets, toatlBAMarkets], // -3 for markets with 0 collateral factor
      // );
    },
  });

  describe("Post-VIP state", async () => {
    it("check current distribution configs", async () => {
      expect(await psr.getPercentageDistribution(USDC_PRIME_CONVERTER, 0)).to.equal(1000);
      // USDT has been updated
      expect(await psr.getPercentageDistribution(USDT_PRIME_CONVERTER, 0)).to.equal(1000);
      expect(await psr.getPercentageDistribution(BTCB_PRIME_CONVERTER, 0)).to.equal(0);
      expect(await psr.getPercentageDistribution(ETH_PRIME_CONVERTER, 0)).to.equal(0);
    });

    it("check current prime reward distribution speeds", async () => {
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDC)).to.equal(9220);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(USDT)).to.equal(7000);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(BTCB)).to.equal(315393518518);
      expect(await primeLiquidityProvider.tokenDistributionSpeeds(ETH)).to.equal(6109664351851);
    });

    it("check Prime multipliers", async () => {
      // const usdcMarket = await prime.markets(vUSDC);
      // expect(usdcMarket.supplyMultiplier).to.equal(2000000000000000000);
      // expect(usdcMarket.borrowMultiplier).to.equal(0);
      const usdtMarket = await prime.markets(vUSDT);
      expect(usdtMarket.supplyMultiplier).to.equal(2000000000000000000n);
      expect(usdtMarket.borrowMultiplier).to.equal(0);
    });

  });
});
