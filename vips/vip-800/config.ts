import type { LzChainId } from "src/types";

// VIP-800 — DeviationSentinel parameter retune
//
// Shared shapes used by the proposal builder, address files, and the simulation
// suite. Per-chain market tables live in `addresses/<chain>.ts` and each entry
// describes one in-scope market — even no-op ones — so the chain manifest is
// self-documenting. The proposal builder filters by `action` and emits commands
// only for entries that require an on-chain write.
//
// Action semantics:
//   retune    — market is already wired (via VIP-613 / VIP-616). Change threshold only.
//               1 call: DeviationSentinel.setTokenConfig(token, (newPct, true))
//   promote   — market not currently wired; full new wire.
//               3 calls: <DexOracle>.setPoolConfig(...) → SentinelOracle.setTokenOracleConfig
//                        → DeviationSentinel.setTokenConfig(token, (pct, true))
//   poolSwap  — wired, but moving to a different pool (and possibly different DEX oracle).
//               3 calls: same shape as promote — re-register pool, repoint SentinelOracle,
//                        set new threshold.
//   skip      — no on-chain action; entry exists for documentation only.

export type MarketAction = "retune" | "promote" | "poolSwap" | "skip";

export type OracleType = "uniswap" | "curve" | "aerodrome";

// Common shape for every market entry. `targetPct` is the post-VIP threshold;
// `currentPct` is the pre-VIP value (for documentation + simulation pre-assertions only).
export interface MarketEntry {
  symbol: string;
  token: string;
  pool: string;
  currentPct: number; // pre-VIP-800 on-chain threshold (0 if never wired)
  targetPct: number; // post-VIP-800 threshold (ignored when action = skip)
  action: MarketAction;
  // Required for promote / poolSwap.
  oracleType?: OracleType;
  // Curve-only (StableSwap-NG): index of priced asset in pool.coins().
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
