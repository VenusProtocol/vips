import { expect } from "chai";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import {
  expectEvents,
  setMaxStalePeriod, // initMainnetUser
} from "src/utils";
import { checkRiskParameters } from "src/vip-framework/checks/checkRiskParameters";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, testVip } from "src/vip-framework/index";

import vip790, {
  CONVERSION_INCENTIVE,
  EMODE_POOL,
  MAIN_ORACLE_ROLE,
  PROTOCOL_SHARE_RESERVE,
  PT_clisBNB_25JUN2026,
  RATE_MODEL,
  convertAmountToVTokens,
  converterBaseAssets,
  marketSpecs, // PT_clisBNB_25JUN2026_PENDLE_ORACLE,
} from "../../vips/vip-790/bsctestnet";
import CAPPED_ORACLE_ABI from "./abi/CappedOracle.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import VTOKEN_ABI from "./abi/VToken.json";

const BLOCKS_PER_YEAR = BigNumber.from(10512000);

const { RESILIENT_ORACLE, ACCESS_CONTROL_MANAGER, NORMAL_TIMELOCK, UNITROLLER } = NETWORK_ADDRESSES.bsctestnet;

const format = (amount: BigNumber, spec: { decimals: number; symbol: string }) =>
  `${formatUnits(amount, spec.decimals)} ${spec.symbol}`;

forking(83980292, async () => {
  const resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);
  const comptroller = new ethers.Contract(UNITROLLER, COMPTROLLER_ABI, ethers.provider);
  const vToken = marketSpecs.vToken;
  const vTokenContract = new ethers.Contract(vToken.address, VTOKEN_ABI, ethers.provider);
  const slisBNB = new ethers.Contract("0xd2aF6A916Bc77764dc63742BC30f71AF4cF423F4", ERC20_ABI, ethers.provider);
  const WBNB = new ethers.Contract("0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", ERC20_ABI, ethers.provider);

  before(async () => {
    // // Note: When we are calling setTokenConfig here in the pre-VIP setup, we are able to get getOracle and getPrice
    // // import initMainnetUser and PT_clisBNB_25JUN2026_PENDLE_ORACLE
    // const impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("2"));
    // await resilientOracle
    //   .connect(impersonatedTimelock)
    //   .setTokenConfig([
    //     PT_clisBNB_25JUN2026,
    //     [PT_clisBNB_25JUN2026_PENDLE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
    //     [true, false, false],
    //     false,
    //   ]);

    await setMaxStalePeriod(resilientOracle, slisBNB);

    await setMaxStalePeriod(resilientOracle, WBNB);
  });

  describe("Pre-VIP behavior", () => {
    it("should have correct number of markets in the core pool", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.not.contain(vToken.address);
    });

    it("should not have PT-clisBNB-25JUN2026 in BNB emode group", async () => {
      const marketData = await comptroller.poolMarkets(EMODE_POOL.id, vToken.address);
      expect(marketData.isListed).to.equal(false);
    });

    it("should have zero collateral factor", async () => {
      const marketData = await comptroller.poolMarkets(EMODE_POOL.id, vToken.address);
      const coreMarketData = await comptroller.markets(vToken.address);
      console.log("Collateral Factor in Emode Pool:", formatUnits(marketData.collateralFactorMantissa, 18));
      console.log("Collateral Factor in Core Pool:", formatUnits(coreMarketData.collateralFactorMantissa, 18));
      expect(marketData.collateralFactorMantissa).to.equal(0);
      expect(coreMarketData.collateralFactorMantissa).to.equal(0);
    });

    it("check resilientOracle getOracle", async () => {
      const oracleInfo = await resilientOracle.getOracle(PT_clisBNB_25JUN2026, MAIN_ORACLE_ROLE);
      console.log("Oracle info before VIP:", oracleInfo);
    });

    it(`check price ${vToken.underlying.symbol}`, async () => {
      await expect(resilientOracle.getPrice(PT_clisBNB_25JUN2026)).to.be.reverted;
    });

    // Note: When we call setTokenConfig in the pre-VIP setup, getPrice will return the price.
    // it(`check price ${vToken.underlying.symbol}`, async () => {
    //   const price = await resilientOracle.getPrice(PT_clisBNB_25JUN2026);
    //   console.log("Price after VIP:", price);
    //   const underlyingPrice = await resilientOracle.getUnderlyingPrice(vToken.address);
    //   console.log("Underlying Price after VIP:", underlyingPrice.toString());
    // });
  });

  testVip("VIP-790", await vip790(), {
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
          // "NewCollateralFactor", // Commented out as setCollateralFactor is commented in VIP
          // "NewLiquidationThreshold", // Commented out as setCollateralFactor is commented in VIP
          "NewLiquidationIncentive",
        ],
        [1, 1, 1, 1, 1, 1, 1, 2],
      );
      await expectEvents(
        txResponse,
        [CAPPED_ORACLE_ABI],
        ["SnapshotUpdated", "GrowthRateUpdated", "SnapshotGapUpdated"],
        [1, 1, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("Check collateral factors", async () => {
      const marketData = await comptroller.poolMarkets(EMODE_POOL.id, vToken.address);
      const coreMarketData = await comptroller.markets(vToken.address);
      console.log("Collateral Factor in Emode Pool:", formatUnits(marketData.collateralFactorMantissa, 18));
      console.log("Collateral Factor in Core Pool:", formatUnits(coreMarketData.collateralFactorMantissa, 18));
    });

    it("check resilientOracle getOracle", async () => {
      const oracleInfo = await resilientOracle.getOracle(PT_clisBNB_25JUN2026, MAIN_ORACLE_ROLE);
      console.log("Oracle info after VIP:", oracleInfo);
    });

    // it(`check price ${vToken.underlying.symbol}`, async () => {
    //   const price = await resilientOracle.getPrice(PT_clisBNB_25JUN2026);
    //   console.log("Price after VIP:", price.toString());
    //   const underlyingPrice = await resilientOracle.getUnderlyingPrice(vToken.address);
    //   console.log("Underlying Price after VIP:", underlyingPrice.toString());
    // });

    it("should have added vToken to the core pool", async () => {
      const markets = await comptroller.getAllMarkets();
      expect(markets).to.contain(vToken.address);
    });

    describe(`Checks for ${vToken.symbol}`, () => {
      it("has correct owner", async () => {
        expect(await vTokenContract.admin()).to.equal(NORMAL_TIMELOCK);
      });

      it("has correct ACM", async () => {
        expect(await vTokenContract.accessControlManager()).to.equal(ACCESS_CONTROL_MANAGER);
      });

      it("has correct protocol share reserve", async () => {
        expect(await vTokenContract.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
      });

      describe("Balances", () => {
        const vTokenSupply = convertAmountToVTokens(marketSpecs.initialSupply.amount, vToken.exchangeRate);
        const vTokenSupplyForReceiver = vTokenSupply.sub(marketSpecs.initialSupply.vTokensToBurn);

        it(`should have balance of underlying = ${format(
          marketSpecs.initialSupply.amount,
          vToken.underlying,
        )}`, async () => {
          const underlying = new ethers.Contract(vToken.underlying.address, ERC20_ABI, ethers.provider);
          expect(await underlying.balanceOf(vToken.address)).to.equal(marketSpecs.initialSupply.amount);
        });

        it(`should have total supply of ${format(vTokenSupply, vToken)}`, async () => {
          expect(await vTokenContract.totalSupply()).to.equal(vTokenSupply);
        });

        it(`should send ${format(vTokenSupplyForReceiver, vToken)} to receiver`, async () => {
          const receiverBalance = await vTokenContract.balanceOf(marketSpecs.initialSupply.vTokenReceiver);
          expect(receiverBalance).to.equal(vTokenSupplyForReceiver);
        });

        it(`should burn ${format(marketSpecs.initialSupply.vTokensToBurn, vToken)}`, async () => {
          const burnt = await vTokenContract.balanceOf(ethers.constants.AddressZero);
          expect(burnt).to.equal(marketSpecs.initialSupply.vTokensToBurn);
        });

        it(`should leave no ${vToken.symbol} in the timelock`, async () => {
          const timelockBalance = await vTokenContract.balanceOf(NORMAL_TIMELOCK);
          expect(timelockBalance).to.equal(0);
        });
      });

      it('should have name = "Venus PT Lista collateral BNB 25JUN2026"', async () => {
        expect(await vTokenContract.name()).to.equal("Venus PT Lista collateral BNB 25JUN2026");
      });

      checkRiskParameters(vToken.address, vToken, marketSpecs.riskParameters);
      checkVToken(vToken.address, {
        ...vToken,
        name: "Venus PT Lista collateral BNB 25JUN2026",
      });
      checkInterestRate(
        RATE_MODEL,
        vToken.symbol,
        {
          base: "0",
          multiplier: "0.0135",
          jump: "0.3",
          kink: "0.5",
        },
        BLOCKS_PER_YEAR,
      );
    });

    describe("Paused markets", () => {
      it("should pause borrowing on PT-clisBNB-25JUN2026", async () => {
        expect(await comptroller.actionPaused(vToken.address, 2)).to.equal(true);
      });
    });

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);
        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset ${vToken.underlying.symbol}`, async () => {
          const result = await converterContract.conversionConfigurations(baseAsset, PT_clisBNB_25JUN2026);
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });

    describe("BNB Emode Group", () => {
      it("should set the correct risk parameters for PT-clisBNB-25JUN2026", async () => {
        const marketData = await comptroller.poolMarkets(EMODE_POOL.id, vToken.address);
        expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
        expect(marketData.isListed).to.be.equal(true);
        // passed 0 correct value is EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.collateralFactor (setCollateralFactor is commented out in VIP)
        expect(marketData.collateralFactorMantissa).to.be.equal(0);
        // passed 0 correct value is EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.liquidationThreshold (setCollateralFactor is commented out in VIP)
        expect(marketData.liquidationThresholdMantissa).to.be.equal(0);
        expect(marketData.liquidationIncentiveMantissa).to.be.equal(
          EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.liquidationIncentive,
        );
        expect(marketData.isBorrowAllowed).to.be.equal(EMODE_POOL.marketsConfig.vPT_clisBNB_25JUN2026.borrowAllowed);
      });
    });
  });
});
