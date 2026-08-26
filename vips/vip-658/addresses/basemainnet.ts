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
export const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const CBBTC = "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf";
export const WSTETH = "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452";

// ============================================================
// Pool addresses (carried for documentation only — no pool changes on Base)
// ============================================================
const POOL_WETH_USDC_UNIV3 = "0x6c561b446416e1a00e8e93e221854d6ea4171372";
const POOL_CBBTC_USDC_AERO = "0x4e962bb3889bf030368f56810a9c96b83cb3e778";
const POOL_WSTETH_WETH_AERO = "0x861a2922be165a5bd41b1e482b49216b465e1b5f";

// ============================================================
// Base market table (threshold-only retune → 5%; no pool changes per V2 doc).
// currentPct verified on the fork's pre-VIP assertions (2026-08-26): USDC = 1%,
// cbBTC / wstETH = 3%.
// ============================================================
export const BASEMAINNET_MARKETS: MarketEntry[] = [
  { symbol: "USDC", token: USDC, pool: POOL_WETH_USDC_UNIV3, currentPct: 1, targetPct: 5, action: "retune" },
  {
    symbol: "cbBTC",
    token: CBBTC,
    pool: POOL_CBBTC_USDC_AERO,
    currentPct: 3,
    targetPct: 5,
    action: "retune",
    oracleType: "aerodrome",
  },
  {
    symbol: "wstETH",
    token: WSTETH,
    pool: POOL_WSTETH_WETH_AERO,
    currentPct: 3,
    targetPct: 5,
    action: "retune",
    oracleType: "aerodrome",
  },
];
