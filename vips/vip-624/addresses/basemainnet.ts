import type { MarketEntry } from "../config";

// ============================================================
// DeviationSentinel infrastructure on Base mainnet (deployed via VIP-616)
// ============================================================
export const DEVIATION_SENTINEL = "0x12D09d5b13A673269cdB624D17A42f45a5233076";
export const SENTINEL_ORACLE = "0xCdD6D79Fd313C21967CED04C1b8bE70BDc27574D";
export const UNISWAP_ORACLE = "0xc3b5169a7d5f6341403c74187Db3C4Fe6d447762";
export const AERODROME_ORACLE = "0x5DE0B322A74088fD64CDD01042BE2fBc47FE82EC";

// ============================================================
// Underlying token addresses (Base mainnet)
// ============================================================
export const WETH = "0x4200000000000000000000000000000000000006";
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const CBBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";
export const WSTETH = "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452";
export const WSUPER_OETH_B = "0x6e6cf2eec6aa17d5e63cc5a6df1a76a3a4dc9bce"; // tracked as `skip` for spec preservation

// ============================================================
// Pool addresses
// ============================================================
const POOL_WETH_USDC_UNIV3 = "0x6c561b446416e1a00e8e93e221854d6ea4171372";
const POOL_CBBTC_USDC_AERO = "0x4e962bb3889bf030368f56810a9c96b83cb3e778";
const POOL_WSTETH_WETH_AERO = "0x861a2922be165a5bd41b1e482b49216b465e1b5f";

// ============================================================
// Base market table (4 eligible markets — all already wired by VIP-616)
// ============================================================
export const BASEMAINNET_MARKETS: MarketEntry[] = [
  {
    symbol: "WETH",
    token: WETH,
    pool: POOL_WETH_USDC_UNIV3,
    currentPct: 10,
    targetPct: 10,
    action: "skip",
    note: "10% unchanged",
  },
  {
    symbol: "USDC",
    token: USDC,
    pool: POOL_WETH_USDC_UNIV3,
    currentPct: 10,
    targetPct: 1,
    action: "retune",
    note: "co-trip with WETH on shared pool",
  },
  {
    symbol: "cbBTC",
    token: CBBTC,
    pool: POOL_CBBTC_USDC_AERO,
    currentPct: 10,
    targetPct: 3,
    action: "retune",
    oracleType: "aerodrome",
    note: "wired via AerodromeSlipstreamOracle by VIP-616",
  },
  {
    symbol: "wstETH",
    token: WSTETH,
    pool: POOL_WSTETH_WETH_AERO,
    currentPct: 10,
    targetPct: 3,
    action: "retune",
    oracleType: "aerodrome",
    note: "wired via AerodromeSlipstreamOracle by VIP-616",
  },

  // ── Not Eligible — carried for spec preservation, no on-chain action ──
  {
    symbol: "wsuperOETHb",
    token: WSUPER_OETH_B,
    pool: "0x0000000000000000000000000000000000000000",
    currentPct: 0,
    targetPct: 0,
    action: "skip",
    note: "Not Eligible — no WETH-quoted pool on Aerodrome Slipstream / UniV3 Base; Delist rec",
  },
];
