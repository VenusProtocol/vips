import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, setMaxStalePeriodInBinanceOracle, setMaxStalePeriodInChainlinkOracle } from "src/utils";
import { forking, testVip } from "src/vip-framework";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";

import {
  Actions,
  CONVERSION_INCENTIVE,
  PROTOCOL_SHARE_RESERVE,
  USDFMarketSpec,
  convertAmountToVTokens,
  converterBaseAssets,
  vip521,
} from "../../vips/vip-521/bscmainnet";
import VTOKEN_ABI from "./abi/LegacyPoolVToken.json";
import MOCKTOKEN_ABI from "./abi/MockToken.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";

const RATE_MODEL = "0x52F63686D09d92c367c90BCDBF79A562f81bd6BF";

const NATIVE_TOKEN_ADDR = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const CHAINLINK_BNB_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(51547465, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let usdf: Contract;
  let vUSDF: Contract;

  const provider = ethers.provider;

  before(async () => {
    comptroller = new ethers.Contract(USDFMarketSpec.vToken.comptroller, COMPTROLLER_ABI, provider);
    usdf = new ethers.Contract(USDFMarketSpec.vToken.underlying.address, MOCKTOKEN_ABI, provider);
    vUSDF = new ethers.Contract(USDFMarketSpec.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

    await setMaxStalePeriodInChainlinkOracle(
      bscmainnet.CHAINLINK_ORACLE,
      NATIVE_TOKEN_ADDR,
      CHAINLINK_BNB_FEED,
      bscmainnet.NORMAL_TIMELOCK,
    );

    await setMaxStalePeriodInBinanceOracle(bscmainnet.BINANCE_ORACLE, "BNB");
  });

  describe("Pre-VIP behavior", async () => {
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
    "vip-521",
    await vip521({
      maxStalePeriod: 30 * 24 * 60 * 60, // 30 days in seconds
    }),
    {
      callbackAfterExecution: async txResponse => {
        await expectEvents(
          txResponse,
          [COMPTROLLER_ABI, VTOKEN_ABI],
          ["MarketListed", "NewSupplyCap", "NewCollateralFactor", "NewReserveFactor", "NewProtocolShareReserve"],
          [1, 1, 1, 1, 1, 1],
        );
      },
    },
  );

  describe("Post-VIP behavior", async () => {
    checkInterestRate(RATE_MODEL, "vUSDF", {
      base: USDFMarketSpec.interestRateModel.baseRatePerYear,
      multiplier: USDFMarketSpec.interestRateModel.multiplierPerYear,
      jump: USDFMarketSpec.interestRateModel.jumpMultiplierPerYear,
      kink: USDFMarketSpec.interestRateModel.kink,
    });

    checkVToken(USDFMarketSpec.vToken.address, {
      name: "Venus USDF",
      symbol: "vUSDF",
      decimals: 8,
      underlying: USDFMarketSpec.vToken.underlying.address,
      exchangeRate: USDFMarketSpec.vToken.exchangeRate,
      comptroller: USDFMarketSpec.vToken.comptroller,
    });

    checkRiskParameters(USDFMarketSpec.vToken.address, USDFMarketSpec.vToken, USDFMarketSpec.riskParameters);

    it("check price USDF", async () => {
      const expectedPrice = "1000174500000000000"; // 1.0001745 USD
      expect(await resilientOracle.getPrice(USDFMarketSpec.vToken.underlying.address)).to.equal(expectedPrice);
      expect(await resilientOracle.getUnderlyingPrice(USDFMarketSpec.vToken.address)).to.equal(expectedPrice);
    });

    it("markets have correct owner", async () => {
      expect(await vUSDF.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("markets have correct ACM", async () => {
      expect(await vUSDF.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
    });

    it("markets should have correct protocol share reserve", async () => {
      expect(await vUSDF.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("markets should have correct total supply", async () => {
      const vUSDFSupply = await vUSDF.totalSupply();

      expect(vUSDFSupply).to.equal(
        convertAmountToVTokens(USDFMarketSpec.initialSupply.amount, USDFMarketSpec.vToken.exchangeRate),
      );
    });

    it("markets should have balance of underlying", async () => {
      const usdfBalance = await usdf.balanceOf(vUSDF.address);

      expect(usdfBalance).to.equal(USDFMarketSpec.initialSupply.amount);
    });

    it("should burn vTokens", async () => {
      const vUSDFBalanceBurned = await vUSDF.balanceOf(ethers.constants.AddressZero);

      expect(vUSDFBalanceBurned).to.equal(USDFMarketSpec.initialSupply.vTokensToBurn);
    });

    it("should transfer vTokens to receiver", async () => {
      const vUSDFReceiverBalance = await vUSDF.balanceOf(USDFMarketSpec.initialSupply.vTokenReceiver);

      expect(vUSDFReceiverBalance).to.equal(
        convertAmountToVTokens(USDFMarketSpec.initialSupply.amount, USDFMarketSpec.vToken.exchangeRate).sub(
          USDFMarketSpec.initialSupply.vTokensToBurn,
        ),
      );
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vUSDFTimelockBalance = await vUSDF.balanceOf(bscmainnet.NORMAL_TIMELOCK);

      expect(vUSDFTimelockBalance).to.equal(0);
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
