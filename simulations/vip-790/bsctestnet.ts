/**
 * @title VIP-790 Simulation Test for BSC Testnet
 * @notice This simulation test validates the listing of PT_clisBNB_25JUN2026 (Pendle Principal Token)
 *         market in the Venus Protocol on BSC Testnet.
 *
 * @dev The test performs the following validations:
 *      1. Pre-VIP: Verifies the market is not yet listed and E-mode pool exists but is inactive
 *      2. VIP Execution: Runs the VIP and validates emitted events
 *      3. Post-VIP: Validates all market configurations including:
 *         - Interest rate model parameters
 *         - VToken properties (name, symbol, decimals, exchange rate)
 *         - Risk parameters (collateral factor, liquidation threshold, caps)
 *         - Oracle price configuration
 *         - Access control and ownership
 *         - Initial supply distribution and vToken burning
 *         - Borrowing restrictions (paused and not allowed)
 *         - Converter incentive configurations
 *         - E-mode pool risk parameters
 *
 * @notice Unlike mainnet, testnet does not include mint/redeem user interaction tests
 *         as those are primarily for validating production functionality.
 */
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
  marketSpecs,
  vip790,
} from "../../vips/vip-790/bsctestnet";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";
import SINGLE_TOKEN_CONVERTER_ABI from "./abi/SingleTokenConverter.json";
import VTOKEN_ABI from "./abi/VToken.json";

// Network-specific addresses for BSC Testnet
const { bsctestnet } = NETWORK_ADDRESSES;

// Special address used to represent native BNB in the protocol
const NATIVE_TOKEN_ADDR = "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB";

/**
 * Fork BSC Testnet at block 84342013 to simulate VIP-790 execution
 * This allows testing against the actual testnet state at a specific block height
 */
forking(84342013, async () => {
  // Contract instances used throughout the tests
  let comptroller: Contract; // Pool comptroller for managing market configurations
  let resilientOracle: Contract; // Venus resilient oracle for price feeds
  let vPT_clisBNB_25JUN2026: Contract; // VToken representing the Venus market for PT_clisBNB_25JUN2026

  /**
   * @notice Setup hook that runs before all tests
   * @dev Initializes contract instances and configures oracle stale periods
   *      to prevent price staleness errors during testing on forked state
   */
  before(async () => {
    const provider = ethers.provider;

    // Initialize contract instances with their respective ABIs
    comptroller = new ethers.Contract(marketSpecs.vToken.comptroller, COMPTROLLER_ABI, provider);
    vPT_clisBNB_25JUN2026 = new ethers.Contract(marketSpecs.vToken.address, VTOKEN_ABI, provider);
    resilientOracle = new ethers.Contract(bsctestnet.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, ethers.provider);

    // Configure oracle stale period for BNB to prevent price staleness errors during testing
    // Set max stale period to 10 years (315360000 seconds) for testing purposes
    // Using AddressZero for feed address on testnet as it uses a different oracle setup
    await setMaxStalePeriodInChainlinkOracle(
      bsctestnet.CHAINLINK_ORACLE,
      NATIVE_TOKEN_ADDR,
      ethers.constants.AddressZero,
      bsctestnet.NORMAL_TIMELOCK,
      315360000,
    );
  });

  /**
   * @notice Pre-VIP behavior tests
   * @dev Validates the state before VIP execution to ensure:
   *      - The PT_clisBNB_25JUN2026 market is not yet listed
   *      - The BNB E-mode pool ID exists (required for E-mode configuration)
   *      - The E-mode pool is not yet active (will be activated by VIP)
   */
  describe("Pre-VIP behavior", async () => {
    // Verify that the market does not exist before VIP execution
    it("check PT_clisBNB_25JUN2026 market not listed", async () => {
      const market = await comptroller.markets(marketSpecs.vToken.address);
      expect(market.isListed).to.equal(false);
    });

    // Verify that the E-mode pool ID already exists in the comptroller
    // This is a prerequisite for adding the market to the E-mode pool
    it("check BNB Emode PoolId exist", async () => {
      expect(await comptroller.lastPoolId()).to.be.greaterThanOrEqual(EMODE_POOL.id);
    });

    // Verify that the E-mode pool is not active before VIP execution
    // The VIP will activate this pool when adding the market
    it("check BNB Emode Pool not active", async () => {
      const poolData = await comptroller.pools(EMODE_POOL.id);
      expect(poolData.isActive).to.equal(false);
    });
  });

  /**
   * @notice Execute VIP-790 and validate emitted events
   * @dev The VIP execution should emit the following events:
   *      - MarketListed: Market is added to the comptroller (1 event)
   *      - NewSupplyCap: Supply cap is set for the market (1 event)
   *      - NewBorrowCap: Borrow cap is set for the market (1 event)
   *      - NewAccessControlManager: ACM is configured for the vToken (1 event)
   *      - NewProtocolShareReserve: PSR is set for the vToken (1 event)
   *      - NewReduceReservesBlockDelta: Reserve reduction block delta is set (1 event)
   *      - NewReserveFactor: Reserve factor is configured (1 event)
   *      - NewCollateralFactor: Collateral factor is set (1 event)
   *      - NewLiquidationThreshold: Liquidation threshold is set (1 event)
   *      - NewLiquidationIncentive: Liquidation incentive is set (2 events - base + E-mode)
   *      - PoolMarketInitialized: Market is initialized in the E-mode pool (1 event)
   */
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

  /**
   * @notice Post-VIP behavior tests
   * @dev Comprehensive validation of market state after VIP execution
   *      Tests cover all aspects of market configuration including:
   *      - Interest rate model, vToken properties, risk parameters
   *      - Oracle pricing, ownership, access control
   *      - Initial supply distribution and borrowing restrictions
   */
  describe("Post-VIP behavior", async () => {
    // Verify the correct interest rate model is assigned to the market
    it("check new IRM", async () => {
      expect(await vPT_clisBNB_25JUN2026.interestRateModel()).to.equal(RATE_MODEL);
    });

    // Validate interest rate model parameters (base rate, multiplier, jump multiplier, kink)
    checkInterestRate(RATE_MODEL, "vPT_clisBNB_25JUN2026", {
      base: marketSpecs.interestRateModel.baseRatePerYear,
      multiplier: marketSpecs.interestRateModel.multiplierPerYear,
      jump: marketSpecs.interestRateModel.jumpMultiplierPerYear,
      kink: marketSpecs.interestRateModel.kink,
    });

    // Validate vToken properties (name, symbol, decimals, underlying, exchange rate, comptroller)
    checkVToken(marketSpecs.vToken.address, {
      name: marketSpecs.vToken.name,
      symbol: marketSpecs.vToken.symbol,
      decimals: marketSpecs.vToken.decimals,
      underlying: marketSpecs.vToken.underlying.address,
      exchangeRate: marketSpecs.vToken.exchangeRate,
      comptroller: marketSpecs.vToken.comptroller,
    });

    // Validate risk parameters (collateral factor, liquidation threshold, supply/borrow caps)
    checkRiskParameters(marketSpecs.vToken.address, marketSpecs.vToken, marketSpecs.riskParameters);

    // Verify the oracle returns a non-zero price for PT_clisBNB_25JUN2026
    // On testnet, we only verify the price is non-zero (not an exact value like mainnet)
    it("check price PT_clisBNB_25JUN2026", async () => {
      const underlyingPrice = await resilientOracle.getUnderlyingPrice(marketSpecs.vToken.address);
      expect(underlyingPrice).to.not.equal(0);
    });

    // Verify the market admin is set to the Normal Timelock (governance)
    it("market have correct owner", async () => {
      expect(await vPT_clisBNB_25JUN2026.admin()).to.equal(bsctestnet.NORMAL_TIMELOCK);
    });

    // Verify the Access Control Manager is correctly configured
    it("market have correct ACM", async () => {
      expect(await vPT_clisBNB_25JUN2026.accessControlManager()).to.equal(bsctestnet.ACCESS_CONTROL_MANAGER);
    });

    // Verify the Protocol Share Reserve address for revenue distribution
    it("market should have correct protocol share reserve", async () => {
      expect(await vPT_clisBNB_25JUN2026.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
    });

    // Verify total supply matches the initial supply after VIP execution
    // Total supply = initial amount converted to vTokens using exchange rate
    it("market should have correct total supply", async () => {
      const vPT_clisBNB_25JUN2026Supply = await vPT_clisBNB_25JUN2026.totalSupply();
      expect(vPT_clisBNB_25JUN2026Supply).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate),
      );
    });

    // Verify vTokens were burned by sending to the zero address
    // This is a security measure to establish initial exchange rate
    it("should burn vTokens", async () => {
      const vPT_clisBNB_25JUN2026BalanceBurned = await vPT_clisBNB_25JUN2026.balanceOf(ethers.constants.AddressZero);
      expect(vPT_clisBNB_25JUN2026BalanceBurned).to.equal(marketSpecs.initialSupply.vTokensToBurn);
    });

    // Verify remaining vTokens (after burning) are transferred to the designated receiver
    it("should transfer remaining vTokens to receiver", async () => {
      const slisBNBReceiverBalance = await vPT_clisBNB_25JUN2026.balanceOf(marketSpecs.initialSupply.vTokenReceiver);
      expect(slisBNBReceiverBalance).to.equal(
        convertAmountToVTokens(marketSpecs.initialSupply.amount, marketSpecs.vToken.exchangeRate).sub(
          marketSpecs.initialSupply.vTokensToBurn,
        ),
      );
    });

    // Verify no vTokens remain in the timelock after distribution
    it("should not leave any vTokens in the timelock", async () => {
      const vPT_clisBNB_25JUN2026TimelockBalance = await vPT_clisBNB_25JUN2026.balanceOf(bsctestnet.NORMAL_TIMELOCK);
      expect(vPT_clisBNB_25JUN2026TimelockBalance).to.equal(0);
    });

    // Verify borrowing is paused for this market (action type 2 = Borrow)
    // PT tokens are collateral-only, borrowing should be disabled
    it("should pause vPT_clisBNB_25JUN2026 market", async () => {
      expect(await comptroller.actionPaused(marketSpecs.vToken.address, 2)).to.equal(true);
    });

    // Verify isBorrowAllowed flag is set to false in market configuration
    it("should set borrowAllowed to False for vPT_clisBNB_25JUN2026 market", async () => {
      const vPT_clisBNB_25JUN2026Market = await comptroller.markets(marketSpecs.vToken.address);
      expect(vPT_clisBNB_25JUN2026Market.isBorrowAllowed).to.equal(false);
    });

    /**
     * @notice Converter configuration tests
     * @dev Validates that token converters are properly configured with the correct
     *      conversion incentive for PT_clisBNB_25JUN2026 token conversions.
     *      Converters allow users to swap tokens with an incentive bonus.
     */
    describe("Converters", () => {
      for (const [converterAddress, baseAsset] of Object.entries(converterBaseAssets)) {
        const converterContract = new ethers.Contract(converterAddress, SINGLE_TOKEN_CONVERTER_ABI, ethers.provider);

        // Verify each converter has the correct incentive configured for PT token conversions
        it(`should set ${CONVERSION_INCENTIVE} as incentive in converter ${converterAddress}, for asset vPT_clisBNB_25JUN2026`, async () => {
          const result = await converterContract.conversionConfigurations(
            baseAsset,
            marketSpecs.vToken.underlying.address,
          );
          expect(result.incentive).to.equal(CONVERSION_INCENTIVE);
        });
      }
    });

    /**
     * @notice E-mode (Efficiency Mode) pool configuration tests
     * @dev E-mode allows higher capital efficiency for correlated assets.
     *      This validates that all markets in the BNB E-mode pool have correct
     *      risk parameters configured (collateral factor, liquidation threshold, etc.)
     */
    describe("emode", () => {
      // Verify each market in the E-mode pool has correct risk parameters
      it("should set the correct risk parameters to all pool markets", async () => {
        for (const config of Object.values(EMODE_POOL.marketsConfig)) {
          const marketData = await comptroller.poolMarkets(EMODE_POOL.id, config.address);
          // Verify market is correctly assigned to the E-mode pool
          expect(marketData.marketPoolId).to.be.equal(EMODE_POOL.id);
          expect(marketData.isListed).to.be.equal(true);
          // Verify risk parameters match the configured values
          expect(marketData.collateralFactorMantissa).to.be.equal(config.collateralFactor);
          expect(marketData.liquidationThresholdMantissa).to.be.equal(config.liquidationThreshold);
          expect(marketData.liquidationIncentiveMantissa).to.be.equal(config.liquidationIncentive);
          expect(marketData.isBorrowAllowed).to.be.equal(config.borrowAllowed);
        }
      });
    });
  });
});
