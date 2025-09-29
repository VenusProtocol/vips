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
  EMODE_POOL,
  PROTOCOL_SHARE_RESERVE,
  RATE_MODEL,
  convertAmountToVTokens,
  converterBaseAssets,
  solvBTCBNBMarketSpecs,
  vip553,
  xSolvBTCMarketSpecs,
} from "../../vips/vip-553/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import CAPPED_ORACLE_ABI from "./abi/CappedOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(67073228, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let PTxSolvBTC: Contract;
  let PTSolvBTC_BNB: Contract;
  let vPTxSolvBTC: Contract;
  let vPTSolvBTC_BNB: Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(xSolvBTCMarketSpecs.vToken.comptroller, COMPTROLLER_ABI, provider);
    PTxSolvBTC = new ethers.Contract(xSolvBTCMarketSpecs.vToken.underlying.address, ERC20_ABI, provider);
    PTSolvBTC_BNB = new ethers.Contract(solvBTCBNBMarketSpecs.vToken.underlying.address, ERC20_ABI, provider);
    vPTxSolvBTC = new ethers.Contract(xSolvBTCMarketSpecs.vToken.address, VTOKEN_ABI, provider);
    vPTSolvBTC_BNB = new ethers.Contract(solvBTCBNBMarketSpecs.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

    // set maxStalePeriod
    const BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
    const SolvBTC = "0x6855E14A6df91b8E4D55163d068E9ef2530fd4CE";
    const xSolvBTC = "0x3ea87323806586A0282b50377e0FEa76070F532B";
    for (const asset of [BTCB, SolvBTC, xSolvBTC]) {
      await setMaxStalePeriodInChainlinkOracle(
        NETWORK_ADDRESSES.bsctestnet.CHAINLINK_ORACLE,
        asset,
        ethers.constants.AddressZero,
        NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK,
        315360000,
      );
    }
  });

  describe("Pre-VIP behavior", async () => {
    it("check vPT-xSolvBTC-18DEC2025 market not listed", async () => {
      const market = await comptroller.markets(xSolvBTCMarketSpecs.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });

    it("check vPT-SolvBTC.BNB-18DEC2025 market not listed", async () => {
      const market = await comptroller.markets(solvBTCBNBMarketSpecs.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });

    it("check new BTC Emode PoolId does not exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.lessThan(EMODE_POOL.id);
    });
  });

  testVip("VIP-553", await vip553(), {
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
          "PoolCreated",
          "PoolMarketInitialized",
        ],
        [2, 2, 2, 2, 2, 2, 2, 4, 4, 7, 1, 1, 5],
      );

      await expectEvents(
        txResponse,
        [CAPPED_ORACLE_ABI],
        ["SnapshotUpdated", "GrowthRateUpdated", "SnapshotGapUpdated"],
        [2, 2, 2],
      );

      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [1]);
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Fast-track timelock is not allowed to add new markets to the Core pool", async () => {
      const role = ethers.utils.solidityPack(["address", "string"], [bsctestnet.UNITROLLER, "_supportMarket(address)"]);
      const roleHash = ethers.utils.keccak256(role);
      const acm = new ethers.Contract(bsctestnet.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, ethers.provider);
      expect(await acm.hasRole(roleHash, bsctestnet.FAST_TRACK_TIMELOCK)).to.be.false;
    });

    it("check new IRM", async () => {
      expect(await vPTxSolvBTC.interestRateModel()).to.equal(RATE_MODEL);
      expect(await vPTSolvBTC_BNB.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkInterestRate(RATE_MODEL, "PT-xSolvBTC-18DEC2025", {
      base: xSolvBTCMarketSpecs.interestRateModel.baseRatePerYear,
      multiplier: xSolvBTCMarketSpecs.interestRateModel.multiplierPerYear,
      jump: xSolvBTCMarketSpecs.interestRateModel.jumpMultiplierPerYear,
      kink: xSolvBTCMarketSpecs.interestRateModel.kink,
    });
    checkInterestRate(RATE_MODEL, "PT-SolvBTC.BNB-18DEC2025", {
      base: solvBTCBNBMarketSpecs.interestRateModel.baseRatePerYear,
      multiplier: solvBTCBNBMarketSpecs.interestRateModel.multiplierPerYear,
      jump: solvBTCBNBMarketSpecs.interestRateModel.jumpMultiplierPerYear,
      kink: solvBTCBNBMarketSpecs.interestRateModel.kink,
    });

    checkVToken(xSolvBTCMarketSpecs.vToken.address, {
      name: xSolvBTCMarketSpecs.vToken.name,
      symbol: xSolvBTCMarketSpecs.vToken.symbol,
      decimals: xSolvBTCMarketSpecs.vToken.decimals,
      underlying: xSolvBTCMarketSpecs.vToken.underlying.address,
      exchangeRate: xSolvBTCMarketSpecs.vToken.exchangeRate,
      comptroller: xSolvBTCMarketSpecs.vToken.comptroller,
    });

    checkVToken(solvBTCBNBMarketSpecs.vToken.address, {
      name: solvBTCBNBMarketSpecs.vToken.name,
      symbol: solvBTCBNBMarketSpecs.vToken.symbol,
      decimals: solvBTCBNBMarketSpecs.vToken.decimals,
      underlying: solvBTCBNBMarketSpecs.vToken.underlying.address,
      exchangeRate: solvBTCBNBMarketSpecs.vToken.exchangeRate,
      comptroller: solvBTCBNBMarketSpecs.vToken.comptroller,
    });

    checkRiskParameters(
      xSolvBTCMarketSpecs.vToken.address,
      xSolvBTCMarketSpecs.vToken,
      xSolvBTCMarketSpecs.riskParameters,
    );

    checkRiskParameters(
      solvBTCBNBMarketSpecs.vToken.address,
      solvBTCBNBMarketSpecs.vToken,
      solvBTCBNBMarketSpecs.riskParameters,
    );

    it("check price PT-xSolvBTC-18DEC2025", async () => {
      const expectedPrice = "59148084084743520660000";
      expect(await resilientOracle.getPrice(xSolvBTCMarketSpecs.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(xSolvBTCMarketSpecs.vToken.address)).to.equal(expectedPrice);
    });

    it("check price PT-SolvBTC.BNB-18DEC2025", async () => {
      const expectedPrice = "123095344909661362544921";
      expect(await resilientOracle.getPrice(solvBTCBNBMarketSpecs.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(solvBTCBNBMarketSpecs.vToken.address)).to.equal(expectedPrice);
    });

    it("markets have correct owner", async () => {
      expect(await vPTxSolvBTC.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await vPTSolvBTC_BNB.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("markets have correct ACM", async () => {
      expect(await vPTxSolvBTC.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
      expect(await vPTSolvBTC_BNB.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
    });

    it("markets should have correct protocol share reserve", async () => {
      expect(await vPTxSolvBTC.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
      expect(await vPTSolvBTC_BNB.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("markets should have correct total supply", async () => {
      const vPTxSolvBTCSupply = await vPTxSolvBTC.totalSupply();
      expect(vPTxSolvBTCSupply).to.equal(
        convertAmountToVTokens(xSolvBTCMarketSpecs.initialSupply.amount, xSolvBTCMarketSpecs.vToken.exchangeRate),
      );

      const vPTSolvBTC_BNBSupply = await vPTSolvBTC_BNB.totalSupply();
      expect(vPTSolvBTC_BNBSupply).to.equal(
        convertAmountToVTokens(solvBTCBNBMarketSpecs.initialSupply.amount, solvBTCBNBMarketSpecs.vToken.exchangeRate),
      );
    });

    it("markets should have balance of underlying", async () => {
      const PTxSolvBTCBalance = await PTxSolvBTC.balanceOf(vPTxSolvBTC.address);
      expect(PTxSolvBTCBalance).to.equal(xSolvBTCMarketSpecs.initialSupply.amount);

      const vPTSolvBTC_BNBalance = await PTSolvBTC_BNB.balanceOf(vPTSolvBTC_BNB.address);
      expect(vPTSolvBTC_BNBalance).to.equal(solvBTCBNBMarketSpecs.initialSupply.amount);
    });

    it("should burn vTokens", async () => {
      const vPTxSolvBTCBalanceBurned = await vPTxSolvBTC.balanceOf(ethers.constants.AddressZero);
      expect(vPTxSolvBTCBalanceBurned).to.equal(xSolvBTCMarketSpecs.initialSupply.vTokensToBurn);

      const vPTSolvBTC_BNBBalanceBurned = await vPTSolvBTC_BNB.balanceOf(ethers.constants.AddressZero);
      expect(vPTSolvBTC_BNBBalanceBurned).to.equal(solvBTCBNBMarketSpecs.initialSupply.vTokensToBurn);
    });

    it("should transfer remaining vTokens to receiver", async () => {
      const vPTUSDReceiverBalance = await vPTxSolvBTC.balanceOf(xSolvBTCMarketSpecs.initialSupply.vTokenReceiver);
      expect(vPTUSDReceiverBalance).to.equal(
        convertAmountToVTokens(xSolvBTCMarketSpecs.initialSupply.amount, xSolvBTCMarketSpecs.vToken.exchangeRate).sub(
          xSolvBTCMarketSpecs.initialSupply.vTokensToBurn,
        ),
      );

      const vPTSolvBTC_BNBReceiverBalance = await vPTSolvBTC_BNB.balanceOf(
        solvBTCBNBMarketSpecs.initialSupply.vTokenReceiver,
      );
      expect(vPTSolvBTC_BNBReceiverBalance).to.equal(
        convertAmountToVTokens(
          solvBTCBNBMarketSpecs.initialSupply.amount,
          solvBTCBNBMarketSpecs.vToken.exchangeRate,
        ).sub(solvBTCBNBMarketSpecs.initialSupply.vTokensToBurn),
      );
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vPTxSolvBTCTimelockBalance = await vPTxSolvBTC.balanceOf(bsctestnet.NORMAL_TIMELOCK);
      expect(vPTxSolvBTCTimelockBalance).to.equal(0);

      const vPTSolvBTC_BNBTimelockBalance = await vPTSolvBTC_BNB.balanceOf(bsctestnet.NORMAL_TIMELOCK);
      expect(vPTSolvBTC_BNBTimelockBalance).to.equal(0);
    });

    it("should pause Borrows for new PT markets ", async () => {
      expect(await comptroller.actionPaused(xSolvBTCMarketSpecs.vToken.address, 2)).to.equal(true);
      expect(await comptroller.actionPaused(solvBTCBNBMarketSpecs.vToken.address, 2)).to.equal(true);
    });

    it("should set borrowAllowed to False for new PT markets", async () => {
      const vPTxSolvBTCMarket = await comptroller.markets(xSolvBTCMarketSpecs.vToken.address);
      expect(vPTxSolvBTCMarket.isBorrowAllowed).to.equal(false);

      const vPTSolvBTC_BNBMarket = await comptroller.markets(solvBTCBNBMarketSpecs.vToken.address);
      expect(vPTSolvBTC_BNBMarket.isBorrowAllowed).to.equal(false);
    });

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset PT-xSolvBTC-18DEC2025`, async () => {
          const result = await converterContract.conversionConfigurations(
            baseAsset,
            xSolvBTCMarketSpecs.vToken.underlying.address,
          );
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset PT-SolvBTC.BNB-18DEC2025`, async () => {
          const result = await converterContract.conversionConfigurations(
            baseAsset,
            solvBTCBNBMarketSpecs.vToken.underlying.address,
          );
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });

    describe("emode", () => {
      it("should update lastPoolId to the new pool", async () => {
        expect(await comptroller.lastPoolId()).to.equals(EMODE_POOL.id);
      });

      it("should set the newly created pool as active with correct label", async () => {
        const newPool = await comptroller.pools(EMODE_POOL.id);
        expect(newPool.label).to.equals(EMODE_POOL.label);
        expect(newPool.isActive).to.equals(true);
        expect(newPool.allowCorePoolFallback).to.equal(EMODE_POOL.allowCorePoolFallback);
      });

      it("should set the correct risk parameters to all pool markets", async () => {
        for (const config of Object.values(EMODE_POOL.marketConfig)) {
          const marketData = await comptroller.poolMarkets(EMODE_POOL.id, config.address);
          expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
          expect(marketData.isListed).to.be.equal(true);
          expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
          expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
          expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
          expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
        }
      });
    });
  });
});
