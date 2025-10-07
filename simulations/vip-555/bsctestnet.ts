import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
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
  marketSpecs,
  vip555,
} from "../../vips/vip-555/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import REDSTONE_ORACLE_ABI from "./abi/RedstoneOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(67997171, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let slisBNB: Contract;
  let vslisBNB: Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(marketSpecs.vToken.comptroller, COMPTROLLER_ABI, provider);
    slisBNB = new ethers.Contract(marketSpecs.vToken.underlying.address, ERC20_ABI, provider);
    vslisBNB = new ethers.Contract(marketSpecs.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

    // set maxStalePeriod
    const asBNB = "0xc625f060ad25f4A6c2d9eBF30C133dB61B7AF072";
    const slisbnb = "0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4";
    const impersonatedTimelock = await initMainnetUser(bsctestnet.NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    const redstoneOracle = new ethers.Contract(bsctestnet.REDSTONE_ORACLE, REDSTONE_ORACLE_ABI, ethers.provider);
    await resilientOracle
      .connect(impersonatedTimelock)
      .setTokenConfig([
        asBNB,
        [bsctestnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
        [true, false, false],
        false,
      ]);
    await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(asBNB, parseUnits("1", 18));
    await resilientOracle
      .connect(impersonatedTimelock)
      .setTokenConfig([
        slisbnb,
        [bsctestnet.REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
        [true, false, false],
        false,
      ]);
    await redstoneOracle.connect(impersonatedTimelock).setDirectPrice(slisbnb, parseUnits("1", 18));
  });

  describe("Pre-VIP behavior", async () => {
    it("check slisBNB market not listed", async () => {
      const market = await comptroller.markets(marketSpecs.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });

    it("check new BNB Emode PoolId does not exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.lessThan(EMODE_POOL.id);
    });
  });

  testVip("VIP-555", await vip555(), {
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
          "PoolFallbackStatusUpdated",
        ],
        [1, 1, 1, 1, 1, 1, 1, 2, 2, 4, 1, 1, 3, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check new IRM", async () => {
      expect(await vslisBNB.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkInterestRate(RATE_MODEL, "vslisBNB", {
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

    it("check price slisBNB", async () => {
      const expectedPrice = "1000000000000000000";
      expect(await resilientOracle.getPrice(marketSpecs.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(marketSpecs.vToken.address)).to.equal(expectedPrice);
    });

    it("market have correct owner", async () => {
      expect(await vslisBNB.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("market have correct ACM", async () => {
      expect(await vslisBNB.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
    });

    it("market should have correct protocol share reserve", async () => {
      expect(await vslisBNB.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("market should have correct total supply", async () => {
      const vslisBNBSupply = await vslisBNB.totalSupply();
      expect(vslisBNBSupply).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate),
      );
    });

    it("market should have balance of underlying", async () => {
      const slisBNBBalance = await slisBNB.balanceOf(vslisBNB.address);
      expect(slisBNBBalance).to.equal(marketSpecs.initialSupply.amount);
    });

    it("should burn vTokens", async () => {
      const vslisBNBBalanceBurned = await vslisBNB.balanceOf(ethers.constants.AddressZero);

      expect(vslisBNBBalanceBurned).to.equal(marketSpecs.initialSupply.vTokensToBurn);
    });

    it("should transfer remaining vTokens to receiver", async () => {
      const slisBNBReceiverBalance = await vslisBNB.balanceOf(marketSpecs.initialSupply.vTokenReceiver);

      expect(slisBNBReceiverBalance).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate).sub(
          marketSpecs.initialSupply.vTokensToBurn,
        ),
      );
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vslisBNBTimelockBalance = await vslisBNB.balanceOf(bsctestnet.NORMAL_TIMELOCK);
      expect(vslisBNBTimelockBalance).to.equal(0);
    });

    it("should pause vslisBNB market", async () => {
      expect(await comptroller.actionPaused(marketSpecs.vToken.address, 2)).to.equal(true);
    });

    it("should set borrowAllowed to False for vslisBNB market", async () => {
      const vslisBNBMarket = await comptroller.markets(marketSpecs.vToken.address);
      expect(vslisBNBMarket.isBorrowAllowed).to.equal(false);
    });

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset vslisBNB`, async () => {
          const result = await converterContract.conversionConfigurations(
            baseAsset,
            marketSpecs.vToken.underlying.address,
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
        for (const config of Object.values(EMODE_POOL.marketsConfig)) {
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
