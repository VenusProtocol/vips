import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser, setMaxStalePeriod, setMaxStalePeriodInChainlinkOracle } from "src/utils";
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
  vip790,
} from "../../vips/vip-790/bscmainnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import ERC20_ABI from "./abi/ERC20.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import VTOKEN_ABI from "./abi/VToken.json";

const { bscmainnet } = NETWORK_ADDRESSES;
const NATIVE_TOKEN_ADDR = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";
const BNB_FEED = "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE";
const PT_clisBNB_25JUN2026_HOLDER = "0x3B7e10fFe65c5A59475055D489F71699F7dabfF4";

forking(75229002, async () => {
  let comptroller: Contract;
  let resilientOracle: Contract;
  let Pt_clisBNB_25JUN2026: Contract;
  let vPT_clisBNB_25JUN2026: Contract;
  let bnb: Contract;
  let testUser: Signer;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(marketSpecs.vToken.comptroller, COMPTROLLER_ABI, provider);
    Pt_clisBNB_25JUN2026 = new ethers.Contract(marketSpecs.vToken.underlying.address, ERC20_ABI, provider);
    vPT_clisBNB_25JUN2026 = new ethers.Contract(marketSpecs.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bscmainnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

    const [signer] = await ethers.getSigners();
    testUser = signer;

    const PT_clisBNB_25JUN2026Holder = await initMainnetUser(
      PT_clisBNB_25JUN2026_HOLDER,
      ethers.utils.parseEther("10"),
    );
    await Pt_clisBNB_25JUN2026.connect(PT_clisBNB_25JUN2026Holder).transfer(
      await testUser.getAddress(),
      parseUnits("10", 18),
    );

    // set maxStalePeriod
    bnb = new ethers.Contract(NATIVE_TOKEN_ADDR, ERC20_ABI, ethers.provider);

    const CHAINLINK_ORACLE_BNB = "0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a";
    await setMaxStalePeriodInChainlinkOracle(
      CHAINLINK_ORACLE_BNB,
      NATIVE_TOKEN_ADDR,
      BNB_FEED, // Chainlink BNB/USD feed
      bscmainnet.NORMAL_TIMELOCK,
      315360000,
    );

    await setMaxStalePeriod(resilientOracle, bnb);
    await setMaxStalePeriod(resilientOracle, Pt_clisBNB_25JUN2026);
  });

  describe("Pre-VIP behavior", async () => {
    it("check PT_clisBNB_25JUN2026 market not listed", async () => {
      const market = await comptroller.markets(marketSpecs.vToken.address);
      expect(market.isListed).to.equal(false);
    });

    it("check BNB Emode PoolId exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.greaterThanOrEqual(EMODE_POOL.id);
    });
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
          "NewCollateralFactor",
          "NewLiquidationThreshold",
          "NewLiquidationIncentive",
          "PoolMarketInitialized",
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
      );
    },
  });

  describe("Post-VIP behavior", async () => {
    it("check new IRM", async () => {
      expect(await vPT_clisBNB_25JUN2026.interestRateModel()).to.equal(RATE_MODEL);
    });

    checkInterestRate(RATE_MODEL, "vPT_clisBNB_25JUN2026", {
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

    it("check price PT_clisBNB_25JUN2026", async () => {
      const expectedPrice = parseUnits("912.542908694200730345", 18);
      const underlyingPrice = await resilientOracle.getUnderlyingPrice(marketSpecs.vToken.address);
      expect(underlyingPrice).to.equal(expectedPrice);
    });

    it("market have correct owner", async () => {
      expect(await vPT_clisBNB_25JUN2026.admin()).to.equal(bscmainnet.NORMAL_TIMELOCK);
    });

    it("market have correct ACM", async () => {
      expect(await vPT_clisBNB_25JUN2026.accessControlManager()).to.equal(bscmainnet.ACCESS_CONTROL_MANAGER);
    });

    it("market should have correct protocol share reserve", async () => {
      expect(await vPT_clisBNB_25JUN2026.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    it("market should have correct total supply", async () => {
      const vPT_clisBNB_25JUN2026Supply = await vPT_clisBNB_25JUN2026.totalSupply();
      expect(vPT_clisBNB_25JUN2026Supply).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate),
      );
    });

    it("should burn vTokens", async () => {
      const vPT_clisBNB_25JUN2026BalanceBurned = await vPT_clisBNB_25JUN2026.balanceOf(ethers.constants.AddressZero);
      expect(vPT_clisBNB_25JUN2026BalanceBurned).to.equal(marketSpecs.initialSupply.vTokensToBurn);
    });

    it("should transfer remaining vTokens to receiver", async () => {
      const slisBNBReceiverBalance = await vPT_clisBNB_25JUN2026.balanceOf(marketSpecs.initialSupply.vTokenReceiver);
      expect(slisBNBReceiverBalance).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate).sub(
          marketSpecs.initialSupply.vTokensToBurn,
        ),
      );
    });

    it("should not leave any vTokens in the timelock", async () => {
      const vPT_clisBNB_25JUN2026TimelockBalance = await vPT_clisBNB_25JUN2026.balanceOf(bscmainnet.NORMAL_TIMELOCK);
      expect(vPT_clisBNB_25JUN2026TimelockBalance).to.equal(0);
    });

    it("should pause vPT_clisBNB_25JUN2026 market", async () => {
      expect(await comptroller.actionPaused(marketSpecs.vToken.address, 2)).to.equal(true);
    });

    it("should set borrowAllowed to False for vPT_clisBNB_25JUN2026 market", async () => {
      const vPT_clisBNB_25JUN2026Market = await comptroller.markets(marketSpecs.vToken.address);
      expect(vPT_clisBNB_25JUN2026Market.isBorrowAllowed).to.equal(false);
    });

    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset vPT_clisBNB_25JUN2026`, async () => {
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

    describe("Mint and redeem PT_clisBNB_25JUN2026", async () => {
      it("User can mint vU", async () => {
        const userAddress = await testUser.getAddress();
        const mintAmount = parseUnits("5", 18);

        // Enter market so minted vU can be used as collateral for borrowing
        await comptroller.connect(testUser).enterMarkets([vPT_clisBNB_25JUN2026.address]);

        const vTokenBalBefore = await vPT_clisBNB_25JUN2026.balanceOf(userAddress);
        await Pt_clisBNB_25JUN2026.connect(testUser).approve(vPT_clisBNB_25JUN2026.address, mintAmount);
        await vPT_clisBNB_25JUN2026.connect(testUser).mint(mintAmount);
        expect(await vPT_clisBNB_25JUN2026.balanceOf(userAddress)).to.be.gt(vTokenBalBefore);
      });

      it("User can redeem vU", async () => {
        const userAddress = await testUser.getAddress();
        const uBalBefore = await Pt_clisBNB_25JUN2026.balanceOf(userAddress);
        const redeemAmount = parseUnits("0.5", 18);
        await vPT_clisBNB_25JUN2026.connect(testUser).redeemUnderlying(redeemAmount);
        expect(await Pt_clisBNB_25JUN2026.balanceOf(userAddress)).to.be.gt(uBalBefore);
      });
    });
  });
});
