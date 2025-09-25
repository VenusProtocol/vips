import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  CONVERSION_INCENTIVE,
  EMODE_POOL_SPECS,
  PROTOCOL_SHARE_RESERVE,
  RATE_MODEL,
  convertAmountToVTokens,
  converterBaseAssets,
  marketSpecs,
  vip551,
} from "../../vips/vip-551/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(66611487, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let PTUSDe: Contract;
  let vPTUSDe: Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(marketSpecs.vToken.comptroller, COMPTROLLER_ABI, provider);
    PTUSDe = new ethers.Contract(marketSpecs.vToken.underlying.address, ERC20_ABI, provider);
    vPTUSDe = new ethers.Contract(marketSpecs.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

    // set maxStalePeriod
    const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
    const USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";

    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
      USDT,
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
      315360000,
    );
    await setMaxStalePeriodInChainlinkOracle(
      NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
      USDC,
      ethers.constants.AddressZero,
      NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
      315360000,
    );
  });

  describe("Pre-VIP behavior", async () => {
    it("check PT-sUSDe-30Oct2025 market not listed", async () => {
      const market = await comptroller.markets(marketSpecs.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });
  });

  testVip("VIP-551", await vip551(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [COMPTROLLER_ABI, VTOKEN_ABI],
        [
          "MarketListed",
          "NewSupplyCap",
          "NewBorrowCap",
          "NewAccessControlManager",
          "NewProtocolShareReserve",
          "NewReduceReservesBlockDelta",
          "NewReserveFactor",
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "BorrowAllowedUpdated",
        ],
        [1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 2],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check new IRM", async () => {
      expect(await vPTUSDe.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkInterestRate(RATE_MODEL, "vPTUSDe", {
      base: marketSpecs.interestRateModel.baseRatePerYear,
      multiplier: marketSpecs.interestRateModel.multiplierPerYear,
      jump: marketSpecs.interestRateModel.jumpMultiplierPerYear,
      kink: marketSpecs.interestRateModel.kink,
    });

    checkVToken(marketSpecs.vToken.address, {
      name: marketSpecs.vToken.name,
      symbol: marketSpecs.vToken.symbol,
      decimals: marketSpecs.vToken.decimals,
      underlying: marketSpecs.vToken.underlying.address,
      exchangeRate: marketSpecs.vToken.exchangeRate,
      comptroller: marketSpecs.vToken.comptroller,
    });

    checkRiskParameters(marketSpecs.vToken.address, marketSpecs.vToken, marketSpecs.riskParameters);

    it("check price PT-sUSDe-30Oct2025", async () => {
      const expectedPrice = "935000000000000000";
      expect(await resilientOracle.getPrice(marketSpecs.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(marketSpecs.vToken.address)).to.equal(expectedPrice);
    });

    it("market have correct owner", async () => {
      expect(await vPTUSDe.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("market have correct ACM", async () => {
      expect(await vPTUSDe.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
    });

    it("market should have correct protocol share reserve", async () => {
      expect(await vPTUSDe.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("market should have correct total supply", async () => {
      const vPTUSDeSupply = await vPTUSDe.totalSupply();
      expect(vPTUSDeSupply).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate),
      );
    });

    it("market should have balance of underlying", async () => {
      const PTUSDeBalance = await PTUSDe.balanceOf(vPTUSDe.address);
      expect(PTUSDeBalance).to.equal(marketSpecs.initialSupply.amount);
    });

    it("should burn vTokens (on testnet transfer to VTreasury) and transfer vTokens to receiver", async () => {
      const vPTUSDeReceiverBalance = await vPTUSDe.balanceOf(marketSpecs.initialSupply.vTokenReceiver);
      expect(vPTUSDeReceiverBalance).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate),
      );
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vPTUSDeTimelockBalance = await vPTUSDe.balanceOf(bsctestnet.NORMAL_TIMELOCK);
      expect(vPTUSDeTimelockBalance).to.equal(0);
    });

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset vPTUSDe`, async () => {
          const result = await converterContract.conversionConfigurations(
            baseAsset,
            marketSpecs.vToken.underlying.address,
          );
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });

    describe("emode", () => {
      it("should set the correct risk parameters to all pool markets", async () => {
        for (const market of EMODE_POOL_SPECS.marketsConfig) {
          const marketData = await comptroller.poolMarkets(EMODE_POOL_SPECS.id, market.address);
          expect(marketData.marketPoolId).to.be.equal(EMODE_POOL_SPECS.id);
          expect(marketData.isListed).to.be.equal(true);
          expect(marketData.collateralFactorMantissa).to.be.equal(market.collateralFactor);
          expect(marketData.liquidationThresholdMantissa).to.be.equal(market.liquidationThreshold);
          expect(marketData.liquidationIncentiveMantissa).to.be.equal(market.liquidationIncentive);
          expect(marketData.isBorrowAllowed).to.be.equal(market.borrowAllowed);
        }
      });
    });
  });
});
