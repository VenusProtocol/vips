import type { MarketEntry } from "../config";

// ============================================================
// DeviationSentinel infrastructure on Arbitrum One (deployed via VIP-616)
// ============================================================
export const DEVIATION_SENTINEL = "0xb4CC54B33d34fD809E8fBD83A066158591ED7Fba";
export const SENTINEL_ORACLE = "0x3563CAbc541a0432C66A64942ffB4070a9726226";
export const UNISWAP_ORACLE = "0xB6CFbfe6834EF519f002DBc1a8B81Ea437Ca647D";

// ============================================================
// Underlying token addresses (Arbitrum One)
// ============================================================
export const WETH = "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1";
export const WBTC = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f";
export const USDC = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
export const USDT0 = "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9"; // USD₮0 (Tether's bridged token)
export const ARB = "0x912CE59144191C1204E64559FE8253a0e49E6548";

// ============================================================
// Pool addresses (Uniswap V3)
// ============================================================
// Current pools (carried for documentation only).
const POOL_USDC_USDT0 = "0xbe3ad6a5669dc0b8b12febc03608860c31e2eef6"; // shared USDC / USD₮0
const POOL_WBTC_USDC_005 = "0x0e4831319a50228b9e450861297ab92dee15b44f"; // current WBTC
const POOL_ARB_USDC_030 = "0xaebdca1bc8d89177ebe2308d62af5e74885dccc3"; // current ARB

// Target pools (V2 doc).
const POOL_WBTC_WETH_005 = "0x2f5e87C9312fa29aed5c179E456625D79015299c"; // Uni V3 WBTC/WETH 0.05%
const POOL_ARB_WETH_005 = "0xC6F780497A95e246EB9449f5e4770916DCd6396A"; // Uni V3 ARB/WETH 0.05%

// ============================================================
// Arbitrum One market table
// currentPct: USDC = 1%, USD₮0 = 1%, WBTC = 3% (VIP-624); ARB = 10% (VIP-616,
// left as skip in VIP-624). Validated on the fork's pre-VIP assertions.
// ============================================================
export const ARBITRUMONE_MARKETS: MarketEntry[] = [
  // ── Retune → 5% ───────────────────────────────────────────────────────
  { symbol: "USDC", token: USDC, pool: POOL_USDC_USDT0, currentPct: 1, targetPct: 5, action: "retune" },
  {
    symbol: "USD₮0",
    token: USDT0,
    pool: POOL_USDC_USDT0,
    currentPct: 1,
    targetPct: 5,
    action: "retune",
    note: "co-trip with USDC on shared pool",
  },

  // ── Pool move + retune → 5% ───────────────────────────────────────────
  {
    symbol: "WBTC",
    token: WBTC,
    pool: POOL_WBTC_WETH_005,
    currentPct: 3,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "uniswap",
    note: `moves off ${POOL_WBTC_USDC_005} (Uni V3 WBTC/USDC 0.05%) onto Uni V3 WBTC/WETH 0.05%`,
  },

  // ── Pool move only (threshold left unchanged; not in the doc's threshold table) ──
  {
    symbol: "ARB",
    token: ARB,
    pool: POOL_ARB_WETH_005,
    currentPct: 10,
    targetPct: 10,
    action: "poolOnly",
    oracleType: "uniswap",
    note: `moves off ${POOL_ARB_USDC_030} (Uni V3 ARB/USDC 0.30%) onto Uni V3 ARB/WETH 0.05%; threshold unchanged`,
  },
];
