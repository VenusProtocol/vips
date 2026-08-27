import type { LzChainId } from "src/types";

// DeviationSentinel 2026-08 parameter adjustment (VIP-658)
//
// Shared shapes used by the proposal builder, address files, and the simulation
// suite. Per-chain market tables live in `addresses/<chain>.ts` and each entry
// describes one in-scope market — even no-op ones — so the chain manifest is
// self-documenting. The proposal builder filters by `action` and emits commands
// only for entries that require an on-chain write.
//
// Action semantics:
//   retune    — market is already wired. Change threshold only.
//               1 call: DeviationSentinel.setTokenConfig(token, (newPct, true))
//   poolSwap  — wired, but moving to a different pool (and possibly different DEX oracle),
//               and also retuning the threshold.
//               3 calls: re-register pool, repoint SentinelOracle, set new threshold.
//   poolOnly  — wired, moving to a different pool WITHOUT changing the threshold. Used for
//               markets that are not in the doc's threshold tables (ETH WETH, Arbitrum ARB).
//               2 calls: <DexOracle>.setPoolConfig(...) → SentinelOracle.setTokenOracleConfig.
//               The existing DeviationSentinel threshold is left untouched.
//   disable   — stop monitoring the market without clearing its stored config.
//               1 call: DeviationSentinel.setTokenMonitoringEnabled(token, false).
//               (Config *clearing* would need a new contract function; see VIP-658 spec.)
//   skip      — no on-chain action; entry exists for documentation only.

export type MarketAction = "retune" | "poolSwap" | "poolOnly" | "disable" | "skip";

export type OracleType = "uniswap" | "curve" | "aerodrome";

// Common shape for every market entry. `targetPct` is the post-VIP threshold;
// `currentPct` is the pre-VIP value (for documentation + simulation pre-assertions only).
export interface MarketEntry {
  symbol: string;
  token: string;
  pool: string;
  currentPct: number; // pre on-chain threshold (0 if never wired)
  targetPct: number; // post on-chain threshold (ignored when action = skip/disable; == currentPct for poolOnly)
  action: MarketAction;
  // Pre-VIP `enabled` flag of tokenConfigs. Defaults to (currentPct > 0). Set explicitly for a
  // market that is wired (deviation != 0) yet disabled — e.g. BSC DAI, disabled by VIP-644.
  currentEnabled?: boolean;
  // Required for poolSwap / poolOnly.
  oracleType?: OracleType;
  // When the SentinelOracle already routes this token to the target DEX oracle (the oracle
  // *type* is unchanged — e.g. curve→curve or uniswap→uniswap), the setTokenOracleConfig call
  // is a pure no-op. Set true to elide it. Used on Ethereum to keep the single cross-chain
  // LayerZero message within its payload-size cap; the elision is only valid because the
  // current binding is verified on-chain (and re-asserted pre-VIP in the simulation).
  skipOracleRepoint?: boolean;
  // Curve-only (StableSwap / StableSwap-NG): index of priced asset in pool.coins().
  coinIndex?: number;
  // Curve-only: index of the reference asset (its USD price feeds the protected quote).
  refCoinIndex?: number;
  // Curve-only: address of the reference asset; must match pool.coins(refCoinIndex).
  referenceToken?: string;
  // Curve-only: ERC-20 decimals of the priced asset.
  assetDecimals?: number;
  // Free-form note (TVL, delist status, co-trip pool, etc.).
  note?: string;
}

// Per-chain runtime context — bundles the addresses + market table + LayerZero dest.
export interface ChainContext {
  name: string;
  deviationSentinel: string;
  sentinelOracle: string;
  uniswapOracle: string;
  curveOracle?: string;
  aerodromeOracle?: string;
  markets: MarketEntry[];
  dstChainId?: LzChainId; // omitted for BSC
}
