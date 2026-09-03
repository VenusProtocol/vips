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
// VIP-671 — Hub-Funded Spoke pool parameters (BNB Chain Testnet).
//
// A Hub-Funded Spoke pool splits the two sides of one isolated pool (PRD §4.1):
//   - LIQUIDITY side (USDT): borrowable, supply restricted to the market's supply allowlist, whose
//     only member is the Hub's Spoke source. Never usable as collateral -> CF = LT = 0.
//   - COLLATERAL side (TSLAB / NVDAB / SPCXB): permissionless supply, NOT borrowable in-market ->
//     borrowCap = 0. Borrow power is shared across every liquidity asset in the pool (PRD §6, C5).
//
// Values marked TODO(risk) are NOT specified anywhere in the PRD and are placeholders that must be
// replaced with signed-off numbers before this VIP is proposed.
// ===================================================================================================

/// The pool-wide fallback discount, used by any market with no discount of its own, and by
/// `healAccount` / `liquidateAccount` routing. `SpokeComptroller.setLiquidationIncentive` rejects
/// anything below MIN_POOL_LIQUIDATION_INCENTIVE_MANTISSA = 1.05e18 (1e18 + the VToken default
/// protocol seize share of 5%), so this cannot be set lower while markets keep the default share.
export const POOL_LIQUIDATION_INCENTIVE = parseUnits("1.1", 18);

/// TODO(risk): not specified in the PRD. These are the values the isolated-pools hub-spoke fork suite
/// lists the pool with, carried over so the pool is registered in a known-good state.
export const CLOSE_FACTOR = parseUnits("0.5", 18);
export const MIN_LIQUIDATABLE_COLLATERAL = parseUnits("100", 18); // USD

export const POOL_NAME = "Hub-Funded Spoke";

/// Every isolated market on BNB Chain reduces reserves on this cadence.
export const REDUCE_RESERVES_BLOCK_DELTA = "28800";

/// PRD C8: the Hub is the only lender and absorbs 100% of any bad debt, so it keeps 100% of the
/// interest. The reserve-factor PARAMETER is kept so governance can start charging later; the VALUE
/// is zero for now ("all interest will go to users directly without RF").
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
  /// `SpokeComptroller.setMarketLiquidationIncentive`, keyed on the COLLATERAL market — it prices the
  /// collateral being seized, not the debt being repaid (PRD C7). Undefined leaves the market on the
  /// pool-wide fallback. Must be >= 1e18 + that market's `protocolSeizeShareMantissa`.
  liquidationIncentive?: BigNumber;
  supplyCap: BigNumber;
  borrowCap: BigNumber;
  reserveFactor: BigNumber;
  initialSupply: BigNumber;
};

// ---------------------------------------------------------------------------------------------------
// Liquidity side. Supplied only by the Hub's Spoke source; borrowed by anyone with collateral.
// bsctestnet USDT has 6 DECIMALS, so every amount here is 6-decimal.
// ---------------------------------------------------------------------------------------------------
export const MARKET_USDT: SpokeMarket = {
  side: "liquidity",
  symbol: "vUSDT_HubSpoke",
  vToken: VUSDT_SPOKE,
  underlying: USDT,
  underlyingDecimals: 6,
  interestRateModel: IRM_USDT,
  // Not collateral in this pool — nobody borrows against the Hub's own liquidity (PRD §4.1).
  collateralFactor: parseUnits("0", 18),
  liquidationThreshold: parseUnits("0", 18),
  // TODO(risk): supply cap is the Hub's ceiling on this market. Not specified in the PRD; the binding
  // controls are also the YieldGroup per-resource cap and the Hub's dual cap on the Spoke source.
  supplyCap: parseUnits("1000000", 6),
  // TODO(risk): borrow cap. PRD §4.1 default is "same as the supply cap".
  borrowCap: parseUnits("1000000", 6),
  reserveFactor: RESERVE_FACTOR,
  // TODO: testnet seed only. PoolRegistry.addMarket requires initialSupply > 0 and mints it to the
  // vTokenReceiver; the Timelock faucets it first.
  initialSupply: parseUnits("10000", 6),
};

// ---------------------------------------------------------------------------------------------------
// Collateral side. Permissionless supply (PRD §4.2 — the optional collateral-deposit allowlist is OFF
// by default and this VIP leaves it off). Non-borrowable in-market -> borrowCap = 0.
//
// CF / LT come from the PRD §6 worked example.
// TODO(risk): §6 is labelled a worked example and its prices ($200 SPCXB / $210 NVDAB / $375 TSLAB) do
// not match the mocked testnet prices VIP-633 set ($192 / $200 / $400), and VIP-633 listed the same
// three mocks in the testnet Core pool at LOWER factors (TSLAB and NVDAB 0.6/0.7, SPCXB 0.5/0.65).
// Confirm with risk which set applies to the spoke pool before proposing.
// ---------------------------------------------------------------------------------------------------
const collateralDefaults = {
  side: "collateral" as const,
  underlyingDecimals: 18,
  interestRateModel: IRM_BSTOCK,
  borrowCap: parseUnits("0", 18),
  reserveFactor: RESERVE_FACTOR,
  // TODO(risk): pinned to the pool-wide value so the market does not silently move if the pool default
  // is retuned. PRD C7 wants this DIFFERENTIATED by collateral volatility, which is the whole point of
  // the per-market setter — risk to supply the per-asset numbers.
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

/// Liquidity market first: `PoolRegistry.addMarket` seeds it with `mintBehalf`, and the supply
/// allowlist can only be armed afterwards (see the ordering note in bsctestnet.ts).
export const MARKETS: SpokeMarket[] = [MARKET_USDT, MARKET_TSLAB, MARKET_NVDAB, MARKET_SPCXB];

// ---------------------------------------------------------------------------------------------------
// Hub caps for `Hub.addYieldGroup(source, absoluteCap, percentageCapBps)`.
// ---------------------------------------------------------------------------------------------------
/// The Hub rejects `type(uint256).max` as InvalidCap; `type(uint128).max` is the canonical "no ceiling".
export const ABSOLUTE_CAP_UNBOUNDED = "340282366920938463463374607431768211455";
/// 10_000 bps disables the percentage-of-TVL dimension, leaving only the absolute cap binding.
export const PERCENTAGE_CAP_DISABLED = 10_000;

/// TODO(risk): the whole spoke programme's exposure ceiling on the USDT Hub. Left unbounded here to
/// match the testnet policy every other group on this Hub was registered with; a real number belongs
/// here before mainnet, and can be tightened on testnet with `lowerYieldGroupCap`.
export const SPOKE_SOURCE_ABSOLUTE_CAP = ABSOLUTE_CAP_UNBOUNDED;
