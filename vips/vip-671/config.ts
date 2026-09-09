import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { IRM_SPOKE, USDC, USDT, VUSDC_SPOKE, VUSDT_SPOKE } from "./addresses/bsctestnet";

// ===================================================================================================
// VIP-671 — Hub-Funded Spoke pool parameters (BNB Chain Testnet), PHASE 1.
//
// Every value here is copied from isolated-pools helpers/spokeDeploymentConfig.ts, the file the
// deployment was run from, so the listing matches what was deployed rather than a second opinion.
// That config states its own rationale: the risk parameters mirror the isolated pools' Stablecoins
// pool on the same network, because the spoke pool restricts WHO may supply, borrow and liquidate
// rather than taking more risk per market.
//
// The split that makes this a spoke pool is not deployment input. Both markets are listed with the
// same risk parameters, and the liquidity side is then metered by arming its supply allowlist on
// `SpokeComptroller` after `addMarket`. See ./bsctestnet.ts step 8.
// ===================================================================================================

/// From spokeDeploymentConfig: closeFactor 0.5, liquidationIncentive 1.1, minLiquidatableCollateral
/// 100 USD. `SpokeComptroller.setLiquidationIncentive` rejects anything below
/// MIN_POOL_LIQUIDATION_INCENTIVE_MANTISSA = 1.05e18 (SpokeComptrollerStorage.sol:138), which is
/// 1e18 + the VToken default protocol seize share of 5%. This fork raises that floor from the
/// upstream 1e18 so a pool cannot be registered paying a default-share market's liquidator less
/// collateral than it repaid. 1.1e18 clears it.
export const CLOSE_FACTOR = parseUnits("0.5", 18);
export const POOL_LIQUIDATION_INCENTIVE = parseUnits("1.1", 18);
export const MIN_LIQUIDATABLE_COLLATERAL = parseUnits("100", 18); // USD

/// Matches the deployment record's pool name exactly.
export const POOL_NAME = "Hub-funded spoke";

/// From spokeDeploymentConfig. Lower than the 28800 the BNB Chain isolated markets run, which suits a
/// testnet where reserves should surface quickly rather than once a day.
export const REDUCE_RESERVES_BLOCK_DELTA = "100";

export type SpokeMarket = {
  symbol: string;
  vToken: string;
  underlying: string;
  underlyingDecimals: number;
  interestRateModel: string;
  collateralFactor: BigNumber;
  liquidationThreshold: BigNumber;
  /// `SpokeComptroller.setMarketLiquidationIncentive`, keyed on the COLLATERAL market: the discount
  /// prices the collateral being seized, not the debt being repaid (PRD FR-5).
  /// Floor: 1e18 + that market's `protocolSeizeShareMantissa` (SpokeComptroller.sol:1220), so 1.05e18
  /// at the 5% both markets were deployed with.
  liquidationIncentive: BigNumber;
  supplyCap: BigNumber;
  borrowCap: BigNumber;
  reserveFactor: BigNumber;
  initialSupply: BigNumber;
};

/// Shared by both markets, straight from spokeDeploymentConfig. Both underlyings have 6 decimals on
/// this chain, so the amounts are 1e6 scaled, as the isolated Stablecoins pool has them here.
const shared = {
  underlyingDecimals: 6,
  interestRateModel: IRM_SPOKE,
  collateralFactor: parseUnits("0.8", 18),
  liquidationThreshold: parseUnits("0.88", 18),
  reserveFactor: parseUnits("0.1", 18),
  initialSupply: parseUnits("10000", 6),
  supplyCap: parseUnits("1000000", 6),
  borrowCap: parseUnits("400000", 6),
  /// Pinned to the pool-wide value rather than differentiated. PRD FR-5 wants this varied by collateral
  /// volatility, which is what the per-market setter is for, but both markets here are stablecoins with
  /// identical risk parameters, so there is nothing to differentiate yet. Setting it explicitly keeps
  /// each market where it is if the pool default is ever retuned, and exercises the spoke-only setter.
  liquidationIncentive: parseUnits("1.1", 18),
};

/// The liquidity side. Supply is metered by the allowlist armed in step 8; borrowing is open to any
/// account with collateral in the pool.
export const MARKET_USDT: SpokeMarket = {
  ...shared,
  symbol: "vUSDT_HubSpoke",
  vToken: VUSDT_SPOKE,
  underlying: USDT,
};

/// The collateral side. Supply stays permissionless: PRD FR-4 makes the collateral-deposit allowlist
/// optional and off by default, and this VIP leaves it off.
export const MARKET_USDC: SpokeMarket = {
  ...shared,
  symbol: "vUSDC_HubSpoke",
  vToken: VUSDC_SPOKE,
  underlying: USDC,
};

/// Liquidity market first, so the market whose supply this pool meters is listed and seeded before its
/// allowlist is armed.
export const MARKETS: SpokeMarket[] = [MARKET_USDT, MARKET_USDC];

/// The market whose supply this VIP restricts. Phase 2 adds the Hub's spoke source to its allowlist.
export const LIQUIDITY_MARKET = MARKET_USDT;

/// The permissionless side. Its underlying is the one that still needs a bounded price window.
export const COLLATERAL_MARKET = MARKET_USDC;

// ---------------------------------------------------------------------------------------------------
// DeviationBoundedOracle configuration for the collateral market's underlying.
//
// USDT already carries a price window on this chain; USDC carried none, so its collateral was priced
// at spot while USDT's was bounded. Every value below is USDT's live config, read off the oracle, so
// the two sides of this pool are priced the same way rather than one being given a window someone
// picked for it.
//
// The oracle seeds the window itself: `_setTokenConfig` reads the current spot and writes it to both
// minPrice and maxPrice, so there is nothing to pass and nothing to time.
// ---------------------------------------------------------------------------------------------------

/// Seconds protection stays active after the last trigger.
export const DBO_COOLDOWN_PERIOD = 3600;
/// Entry deviation. Sits exactly on the oracle's MIN_THRESHOLD of 5e16, which the check allows.
export const DBO_TRIGGER_THRESHOLD = parseUnits("0.05", 18);
/// Exit deviation. Must be strictly below the trigger.
export const DBO_RESET_THRESHOLD = parseUnits("0.02", 18);
/// Bounded pricing on from the start, transient caching off. Both match USDT.
export const DBO_ENABLE_BOUNDED_PRICING = true;
export const DBO_ENABLE_CACHING = false;

// ---------------------------------------------------------------------------------------------------
// ProtocolShareReserve income distribution. `IProtocolShareReserve.Schema`, in declaration order.
// ---------------------------------------------------------------------------------------------------
export const SCHEMA_SPREAD = 0;
export const SCHEMA_LIQUIDATION = 1;

/// The risk fund's existing share of both schemas. Carried over unchanged: this VIP moves the row from
/// `RiskFundConverter` to `RiskFundBuyback`, it does not retune the allocation. bscmainnet holds the
/// same 2000 bps on both schemas.
export const RISK_FUND_SHARE_BPS = 2000;
