// VIP-800 — DeviationSentinel parameter retune
//
// Shared types used by per-chain market tables. Each chain's `addresses/<chain>.ts`
// re-exports an array of MarketEntry describing every market from the task spec,
// even the no-op ones. The proposal builder filters by `action` and emits commands
// only for entries that require an on-chain write.
//
// Action semantics:
//   retune    — market is already wired (via VIP-613 / VIP-616). Change threshold only.
//               1 call: DeviationSentinel.setTokenConfig(token, (newPct, true))
//   disable   — market is wired; switch off monitoring. The stored threshold is left
//               untouched (the contract reverts setTokenConfig with deviation=0 via
//               ZeroDeviation, so we use the single-purpose toggle instead).
//               1 call: DeviationSentinel.setTokenMonitoringEnabled(token, false)
//   promote   — market not currently wired; full new wire.
//               3 calls: <DexOracle>.setPoolConfig(...) → SentinelOracle.setTokenOracleConfig
//                        → DeviationSentinel.setTokenConfig(token, (pct, true))
//   poolSwap  — wired, but moving to a different pool (and possibly different DEX oracle).
//               3 calls: same shape as promote — re-register pool, repoint SentinelOracle,
//                        set new threshold.
//   skip      — present in the spec for completeness but no on-chain action:
//                 • threshold unchanged (e.g. 10% → 10%) and pool unchanged → no-op write
//                 • market is pending delist and was never wired (e.g. BSC TWT/DOT/FIL/BCH)

export type MarketAction = "retune" | "disable" | "promote" | "poolSwap" | "skip";

export type OracleType = "uniswap" | "curve" | "aerodrome";

// Common shape for every entry. `targetPct` is the post-VIP threshold; `currentPct`
// is the pre-VIP value (for documentation / simulation pre-assertions only).
export interface MarketEntry {
  symbol: string;
  token: string;
  pool: string;
  currentPct: number; // pre-VIP-800 on-chain threshold (0 if never wired)
  targetPct: number; // post-VIP-800 threshold (ignored when action = disable/skip)
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
  // Free-form note from the task spec (TVL, delist status, co-trip pool, etc.).
  note?: string;
}
