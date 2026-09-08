import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import {
  IRM_BSTOCK,
  IRM_USDT,
  NVDAB,
  SPCXB,
  TSLAB,
  USDT,
  VNVDAB_SPOKE,
  VSPCXB_SPOKE,
  VTSLAB_SPOKE,
  VUSDT_SPOKE,
} from "./addresses/bsctestnet";

// ===================================================================================================
// VIP-671 — Hub-Funded Spoke pool parameters (BNB Chain Testnet), PHASE 1.
//
// A Hub-Funded Spoke pool splits the two sides of one pool (PRD §4.1):
//   - LIQUIDITY side (USDT): borrowable, supply restricted to the market's supply allowlist. Never
//     usable as collateral -> CF = LT = 0.
//   - COLLATERAL side (TSLAB / NVDAB / SPCXB): permissionless supply, NOT borrowable in-market ->
//     borrowCap = 0. Borrow power is shared across every liquidity asset in the pool (PRD §6).
//
// Values marked TODO(risk) are NOT specified in the PRD and are placeholders that must be replaced
// with signed-off numbers before this VIP is proposed.
// ===================================================================================================

/// The pool-wide fallback discount, used by any market with no discount of its own and by
/// `healAccount` / `liquidateAccount` routing.
/// `SpokeComptroller.setLiquidationIncentive` rejects anything below
/// MIN_POOL_LIQUIDATION_INCENTIVE_MANTISSA = 1.05e18 (SpokeComptrollerStorage.sol:138), which is
/// 1e18 + the VToken default protocol seize share of 5%. This fork raises that floor from the
/// upstream 1e18 so a pool cannot be registered paying a default-share market's liquidator less
/// collateral than it repaid.
/// TODO(risk): not specified in the PRD. 1.1e18 is what the isolated-pools hub-spoke fork suite
/// lists the pool with, carried over so the pool is registered in a known-good state.
export const POOL_LIQUIDATION_INCENTIVE = parseUnits("1.1", 18);

/// TODO(risk): neither value is specified in the PRD. Both are the fork suite's values.
export const CLOSE_FACTOR = parseUnits("0.5", 18);
export const MIN_LIQUIDATABLE_COLLATERAL = parseUnits("100", 18); // USD

export const POOL_NAME = "Hub-Funded Spoke";

/// Every isolated market on BNB Chain reduces reserves on this cadence.
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";

/// PRD C8: the Hub is the only lender on the liquidity side and absorbs any bad debt, so it keeps the
/// interest. The reserve-factor parameter stays so governance can start charging later; the value is
/// zero for now.
export const RESERVE_FACTOR = parseUnits("0", 18);

export type SpokeMarket = {
  side: "liquidity" | "collateral";
  symbol: string;
  vToken: string;
  underlying: string;
  underlyingDecimals: number;
  interestRateModel: string;
  collateralFactor: BigNumber;
  liquidationThreshold: BigNumber;
  /// `SpokeComptroller.setMarketLiquidationIncentive`, keyed on the COLLATERAL market: the discount
  /// prices the collateral being seized, not the debt being repaid (PRD FR-5). Undefined leaves the
  /// market on the pool-wide fallback.
  /// Floor: 1e18 + that market's `protocolSeizeShareMantissa` (SpokeComptroller.sol:1220).
  liquidationIncentive?: BigNumber;
  /// `VToken.setProtocolSeizeShare`. Undefined leaves the market on the deploy default of 5%
  /// (VToken.sol:1595, DEFAULT_PROTOCOL_SEIZE_SHARE_MANTISSA) and emits no command.
  /// The two setters bound each other: `setProtocolSeizeShare` rejects `share + 1e18 > incentive`,
  /// reading the incentive back through `liquidationIncentiveMantissa()`, which resolves per calling
  /// market. To go below 1.05e18 on a market's incentive, lower its seize share FIRST.
  protocolSeizeShare?: BigNumber;
  supplyCap: BigNumber;
  borrowCap: BigNumber;
  reserveFactor: BigNumber;
  initialSupply: BigNumber;
};

// ---------------------------------------------------------------------------------------------------
// Liquidity side. bsctestnet USDT has 6 DECIMALS, so every amount here is 6-decimal.
// ---------------------------------------------------------------------------------------------------
export const MARKET_USDT: SpokeMarket = {
  side: "liquidity",
  symbol: "vUSDT_HubSpoke",
  vToken: VUSDT_SPOKE,
  underlying: USDT,
  underlyingDecimals: 6,
  interestRateModel: IRM_USDT,
  // Not collateral in this pool: nobody borrows against the Hub's own liquidity (PRD §6, CF = 0).
  collateralFactor: parseUnits("0", 18),
  liquidationThreshold: parseUnits("0", 18),
  // TODO(risk): not specified in the PRD. In Phase 2 the binding controls become the YieldGroup
  // per-resource cap and the Hub's dual cap on the spoke source; this is the market-level ceiling.
  supplyCap: parseUnits("1000000", 6),
  // TODO(risk): borrow cap. Nothing in the PRD fixes it.
  borrowCap: parseUnits("1000000", 6),
  reserveFactor: RESERVE_FACTOR,
  // TODO: testnet seed only. `PoolRegistry.addMarket` requires initialSupply > 0 and mints it to the
  // vTokenReceiver; the Timelock faucets it first.
  initialSupply: parseUnits("10000", 6),
};

// ---------------------------------------------------------------------------------------------------
// Collateral side. Permissionless supply (PRD FR-4: the optional collateral-deposit allowlist is off
// by default and this VIP leaves it off). Non-borrowable in-market -> borrowCap = 0.
//
// CF / LT come from the PRD §6 table.
// TODO(risk): §6 is labelled a Worked Example, and its prices ($200 SPCXB / $210 NVDAB / $375 TSLAB)
// do not match the mocked testnet prices ($192 / $200 / $400, read from ResilientOracle while
// drafting). VIP-633 also listed these same three mocks in the testnet Core pool at LOWER factors
// (TSLAB and NVDAB 0.6/0.7, SPCXB 0.5/0.65). Confirm with risk which set applies to the spoke pool.
// The PRD §6 table also names MUB and SNDKB, which have no deployed token on bsctestnet, so they are
// out of scope for this listing.
// ---------------------------------------------------------------------------------------------------
const collateralDefaults = {
  side: "collateral" as const,
  underlyingDecimals: 18,
  interestRateModel: IRM_BSTOCK,
  borrowCap: parseUnits("0", 18),
  reserveFactor: RESERVE_FACTOR,
  // TODO(risk): pinned to the pool-wide value so the market does not move if the pool default is
  // retuned later. PRD FR-5 wants this DIFFERENTIATED by collateral volatility, which is the whole
  // point of the per-market setter, so risk should supply per-asset numbers.
  liquidationIncentive: parseUnits("1.1", 18),
  // TODO: testnet seed only.
  initialSupply: parseUnits("1", 18),
};

export const MARKET_TSLAB: SpokeMarket = {
  ...collateralDefaults,
  symbol: "vTSLAB_HubSpoke",
  vToken: VTSLAB_SPOKE,
  underlying: TSLAB,
  collateralFactor: parseUnits("0.75", 18), // PRD §6
  liquidationThreshold: parseUnits("0.8", 18), // PRD §6
  supplyCap: parseUnits("236", 18), // TODO(risk): copied from VIP-633's Core listing.
};

export const MARKET_NVDAB: SpokeMarket = {
  ...collateralDefaults,
  symbol: "vNVDAB_HubSpoke",
  vToken: VNVDAB_SPOKE,
  underlying: NVDAB,
  collateralFactor: parseUnits("0.75", 18), // PRD §6
  liquidationThreshold: parseUnits("0.8", 18), // PRD §6
  supplyCap: parseUnits("450", 18), // TODO(risk): copied from VIP-633's Core listing.
};

export const MARKET_SPCXB: SpokeMarket = {
  ...collateralDefaults,
  symbol: "vSPCXB_HubSpoke",
  vToken: VSPCXB_SPOKE,
  underlying: SPCXB,
  collateralFactor: parseUnits("0.7", 18), // PRD §6
  liquidationThreshold: parseUnits("0.75", 18), // PRD §6
  supplyCap: parseUnits("500", 18), // TODO(risk): copied from VIP-633's Core listing.
};

/// Liquidity market first, so the market whose supply this pool meters is listed and seeded before
/// its allowlist is armed.
export const MARKETS: SpokeMarket[] = [MARKET_USDT, MARKET_TSLAB, MARKET_NVDAB, MARKET_SPCXB];

// ---------------------------------------------------------------------------------------------------
// ProtocolShareReserve income distribution. `IProtocolShareReserve.Schema`, in declaration order.
// ---------------------------------------------------------------------------------------------------
export const SCHEMA_SPREAD = 0;
export const SCHEMA_LIQUIDATION = 1;

/// The risk fund's existing share of both schemas. Carried over unchanged: this VIP moves the row from
/// `RiskFundConverter` to `RiskFundBuyback`, it does not retune the allocation. bscmainnet holds the
/// same 2000 bps on both schemas.
export const RISK_FUND_SHARE_BPS = 2000;
