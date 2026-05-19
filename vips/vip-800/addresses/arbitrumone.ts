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
// Pool addresses (Uniswap V3 — pool selection unchanged from VIP-616)
// ============================================================
const POOL_WETH_USDC = "0xc6962004f452be9203591991d15f6b388e09e8d0";
const POOL_WBTC_USDC = "0x0e4831319a50228b9e450861297ab92dee15b44f";
// USDC and USD₮0 share the same pool (USDC/USD₮0 pair)
const POOL_USDC_USDT0 = "0xbe3ad6a5669dc0b8b12febc03608860c31e2eef6";
const POOL_ARB_USDC = "0xaebdca1bc8d89177ebe2308d62af5e74885dccc3";

// ============================================================
// Arbitrum market table (5 markets — all already wired by VIP-616)
// ============================================================
export const ARBITRUMONE_MARKETS: MarketEntry[] = [
  {
    symbol: "WETH",
    token: WETH,
    pool: POOL_WETH_USDC,
    currentPct: 10,
    targetPct: 10,
    action: "skip",
    note: "10% unchanged",
  },
  { symbol: "WBTC", token: WBTC, pool: POOL_WBTC_USDC, currentPct: 10, targetPct: 3, action: "retune" },
  { symbol: "USDC", token: USDC, pool: POOL_USDC_USDT0, currentPct: 10, targetPct: 1, action: "retune" },
  {
    symbol: "USD₮0",
    token: USDT0,
    pool: POOL_USDC_USDT0,
    currentPct: 10,
    targetPct: 1,
    action: "retune",
    note: "co-trip with USDC on shared pool",
  },
  {
    symbol: "ARB",
    token: ARB,
    pool: POOL_ARB_USDC,
    currentPct: 10,
    targetPct: 10,
    action: "skip",
    note: "10% unchanged; sub-$1M pool noted in task spec but stays in scope",
  },
];
