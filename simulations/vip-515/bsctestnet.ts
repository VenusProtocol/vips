import { parseUnits } from "@ethersproject/units";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  Actions,
  CONVERSION_INCENTIVE,
  USDFMarketSpec,
  asBNBMarketSpec,
  converterBaseAssets,
  vip514,
} from "../../vips/vip-515/bsctestnet";
import VTOKEN_ABI from "./abi/LegacyPoolVToken.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import ASBNB_ABI from "./abi/asBNB.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOCKTOKEN_ABI from "./abi/mockToken.json";

const RATE_MODEL = "0xE0d3774406296322f42CBf25e96e8388cDAf0A66";

const { bsctestnet } = NETWORK_ADDRESSES;

const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

forking(54514316, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let asBNB: Contract;
  let vasBNB: Contract;
  let usdf: Contract;
  let vUSDF: Contract;

  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(asBNBMarketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    asBNB = new ethers.Contract(asBNBMarketSpec.vToken.underlying.address, ASBNB_ABI, provider);
    vasBNB = new ethers.Contract(asBNBMarketSpec.vToken.address, VTOKEN_ABI, provider);
    usdf = new ethers.Contract(USDFMarketSpec.vToken.underlying.address, MOCKTOKEN_ABI, provider);
    vUSDF = new ethers.Contract(USDFMarketSpec.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  });

  describe("Pre-VIP behavior", async () => {
    it("check asBNB market not listed", async () => {
      const market = await comptroller.markets(asBNBMarketSpec.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });

    it("check asBNB market not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(
        asBNBMarketSpec.vToken.underlying.address,
        Actions.ENTER_MARKET,
      );
      expect(borrowPaused).to.equal(false);
    });

    it("check USDF market not listed", async () => {
      const market = await comptroller.markets(USDFMarketSpec.vToken.underlying.address);
      expect(market.isListed).to.equal(false);
    });

    it("check USDF market not paused", async () => {
      const borrowPaused = await comptroller.actionPaused(
        USDFMarketSpec.vToken.underlying.address,
        Actions.ENTER_MARKET,
      );
      expect(borrowPaused).to.equal(false);
    });
  });

  testVip(
    "VIP-514",
    await vip514({
      maxStalePeriod: 365 * 24 * 60 * 60, // 1 year in seconds
    }),
    {
      callbackAfterExecution: async txResponse => {
        const numberOfNewMarkets = 2;

        await expectEvents(
          txResponse,
          [COMPTROLLER_ABI, VTOKEN_ABI],
          ["MarketListed", "NewSupplyCap", "NewCollateralFactor", "NewReserveFactor", "NewProtocolShareReserve"],
          [
            numberOfNewMarkets,
            numberOfNewMarkets,
            numberOfNewMarkets,
            numberOfNewMarkets,
            numberOfNewMarkets,
            numberOfNewMarkets,
          ],
        );
      },
    },
  );

  describe("Post-VIP behavior", async () => {
    checkInterestRate(RATE_MODEL, "asBNB", {
      base: asBNBMarketSpec.interestRateModel.baseRatePerYear,
      multiplier: asBNBMarketSpec.interestRateModel.multiplierPerYear,
      jump: asBNBMarketSpec.interestRateModel.jumpMultiplierPerYear,
      kink: asBNBMarketSpec.interestRateModel.kink,
    });

    checkInterestRate(RATE_MODEL, "vUSDF", {
      base: USDFMarketSpec.interestRateModel.baseRatePerYear,
      multiplier: USDFMarketSpec.interestRateModel.multiplierPerYear,
      jump: USDFMarketSpec.interestRateModel.jumpMultiplierPerYear,
      kink: USDFMarketSpec.interestRateModel.kink,
    });

    checkVToken(asBNBMarketSpec.vToken.address, {
      name: "Venus asBNB",
      symbol: "vasBNB",
      decimals: 8,
      underlying: asBNBMarketSpec.vToken.underlying.address,
      exchangeRate: asBNBMarketSpec.vToken.exchangeRate,
      comptroller: asBNBMarketSpec.vToken.comptroller,
    });

    checkVToken(USDFMarketSpec.vToken.address, {
      name: "Venus USDF",
      symbol: "vUSDF",
      decimals: 8,
      underlying: USDFMarketSpec.vToken.underlying.address,
      exchangeRate: USDFMarketSpec.vToken.exchangeRate,
      comptroller: USDFMarketSpec.vToken.comptroller,
    });

    checkRiskParameters(asBNBMarketSpec.vToken.address, asBNBMarketSpec.vToken, asBNBMarketSpec.riskParameters);
    checkRiskParameters(USDFMarketSpec.vToken.address, USDFMarketSpec.vToken, USDFMarketSpec.riskParameters);

    it("check price USDF", async () => {
      const expectedPrice = "1000168910000000000"; // 1.00016891 USD
      expect(await resilientOracle.getPrice(USDFMarketSpec.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(USDFMarketSpec.vToken.address)).to.equal(expectedPrice);
    });

    it("markets have correct owner", async () => {
      expect(await vasBNB.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
      expect(await vUSDF.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    it("markets have correct ACM", async () => {
      expect(await vasBNB.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
      expect(await vUSDF.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
    });

    it("markets should have correct protocol share reserve", async () => {
      expect(await vasBNB.protocolShareReserve()).to.equal(bsctestnet.PROTOCOL_SHARE_RESERVE);
      expect(await vUSDF.protocolShareReserve()).to.equal(bsctestnet.PROTOCOL_SHARE_RESERVE);
    });

    it("markets should have correct total supply", async () => {
      const vasBNBSupply = await vasBNB.totalSupply();
      const vUSDFSupply = await vUSDF.totalSupply();

      expect(vasBNBSupply).to.equal(
        convertAmountToVTokens(asBNBMarketSpec.initialSupply.amount, asBNBMarketSpec.vToken.exchangeRate),
      );
      expect(vUSDFSupply).to.equal(
        convertAmountToVTokens(USDFMarketSpec.initialSupply.amount, USDFMarketSpec.vToken.exchangeRate),
      );
    });

    it("markets should have balance of underlying", async () => {
      const asBNBBalance = await asBNB.balanceOf(vasBNB.address);
      const usdfBalance = await usdf.balanceOf(vUSDF.address);

      expect(asBNBBalance).to.equal(asBNBMarketSpec.initialSupply.amount);
      expect(usdfBalance).to.equal(USDFMarketSpec.initialSupply.amount);
    });

    it("should send vTokens to receiver", async () => {
      const vasBNBBalance = await vasBNB.balanceOf(asBNBMarketSpec.initialSupply.vTokenReceiver);
      const vUSDFBalance = await vUSDF.balanceOf(USDFMarketSpec.initialSupply.vTokenReceiver);

      expect(vasBNBBalance).to.equal(asBNBMarketSpec.initialSupply.vTokensToBurn);
      expect(vUSDFBalance).to.equal(USDFMarketSpec.initialSupply.vTokensToBurn);
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vasBNBTimelockBalance = await vasBNB.balanceOf(bsctestnet.NORMAL_TIMELOCK);
      const vUSDFTimelockBalance = await vUSDF.balanceOf(bsctestnet.NORMAL_TIMELOCK);

      expect(vasBNBTimelockBalance).to.equal(0);
      expect(vUSDFTimelockBalance).to.equal(0);
    });
  });

  describe("Paused markets", () => {
    it("should pause asBNB market", async () => {
      expect(await comptroller.actionPaused(asBNBMarketSpec.vToken.address, Actions.BORROW)).to.equal(true);
    });
  });

  describe("Converters", () => {
    for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
      const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

      it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset USDF`, async () => {
        const result = await converterContract.conversionConfigurations(
          baseAsset,
          USDFMarketSpec.vToken.underlying.address,
        );
        expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
      });
    }
  });
});
