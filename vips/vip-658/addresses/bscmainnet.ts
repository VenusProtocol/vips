import type { MarketEntry } from "../config";

// ============================================================
// DeviationSentinel infrastructure on BSC mainnet (deployed in VIP-590)
// ============================================================
export const DEVIATION_SENTINEL = "0x6599C15cc8407046CD91E5c0F8B7f765fF914870";
export const SENTINEL_ORACLE = "0x58eae0Cf4215590E19860b66b146C5d539cb6f14";
export const PANCAKESWAP_ORACLE = "0x44B72078240A3509979faF450085Fa818401D32E";

// ============================================================
// Underlying token addresses (BSC mainnet)
// ============================================================
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const SOLVBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
export const USD1 = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";
export const SLISBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const WBETH = "0xa2e3356610840701bdf5611a53974510ae27e2e1";
export const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
export const LISUSD = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
export const FDUSD = "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409";
export const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";

// ============================================================
// PancakeSwap V3 pool addresses
// ============================================================
// Pools currently bound (VIP-613 / VIP-624) — carried for documentation.
const POOL_USDT_USDC_001 = "0x92b7807bf19b7dddf89b706143896d05228f3121"; // current USDC pool
const POOL_USDT_WBNB_001 = "0x172fcd41e0913e95784454622d1c3724f546f849"; // current USDT pool
const POOL_U_USDT_001 = "0xa0909f81785f87f3e79309f0e73a7d82208094e4";
const POOL_SOLVBTC_BTCB_005 = "0x12197d7a4fe2d67f9f97ae64d82a44c24b7ad407";
const POOL_USD1_USDT_001 = "0x9c4ee895e4f6ce07ada631c508d1306db7502cce";
const POOL_SLISBNB_WBNB_005 = "0x9474e972f49605315763c296b122cbb998b615cf";
const POOL_WBETH_ETH_005 = "0x379044e32f5a162233e82de19da852255d0951b8";
const POOL_TUSD_USDT_001 = "0xd881d9d0e0767719701305c614903f555d589586";
const POOL_LISUSD_USDT_005 = "0x12e79eb21dcc5852f9c6ac1736d977312925da33";
const POOL_FDUSD_USDT_001 = "0xbf72b6485e4b31601afe7b0a1210be2004d2b1d6";
const POOL_DAI_USDT_001 = "0xe043558b77e2b4c262d7d6e579b005ceb7f4591c";

// Target pool for the USDC + USDT pool move (V2 doc): PancakeSwap V3 USDT/USDC 0.05%.
// Verified on-chain: token0 = USDT, token1 = USDC.
const POOL_USDT_USDC_005 = "0x4f31Fa980a675570939B737Ebdde0471a4Be40Eb";

// ============================================================
// BSC market table
// currentPct values verified on-chain against DeviationSentinel.tokenConfigs
// (2026-08-26): USDC/U/USD1/lisUSD = 1%, USDT/SolvBTC/slisBNB/wBETH = 3%,
// FDUSD = 10%, TUSD = (1%, enabled), DAI = (10%, disabled by VIP-644).
// ============================================================
export const BSC_MARKETS: MarketEntry[] = [
  // ── Retune → 5% (stables previously at 1%) ────────────────────────────
  { symbol: "U", token: U, pool: POOL_U_USDT_001, currentPct: 1, targetPct: 5, action: "retune" },
  { symbol: "USD1", token: USD1, pool: POOL_USD1_USDT_001, currentPct: 1, targetPct: 5, action: "retune" },
  { symbol: "lisUSD", token: LISUSD, pool: POOL_LISUSD_USDT_005, currentPct: 1, targetPct: 5, action: "retune" },

  // ── Retune → 5% (wrappers / LSTs previously at 3%) ────────────────────
  { symbol: "SolvBTC", token: SOLVBTC, pool: POOL_SOLVBTC_BTCB_005, currentPct: 3, targetPct: 5, action: "retune" },
  { symbol: "slisBNB", token: SLISBNB, pool: POOL_SLISBNB_WBNB_005, currentPct: 3, targetPct: 5, action: "retune" },
  { symbol: "wBETH", token: WBETH, pool: POOL_WBETH_ETH_005, currentPct: 3, targetPct: 5, action: "retune" },

  // ── Retune → 5% (FDUSD previously kept at 10% as a thin-pool exception) ─
  { symbol: "FDUSD", token: FDUSD, pool: POOL_FDUSD_USDT_001, currentPct: 10, targetPct: 5, action: "retune" },

  // ── Pool move + retune → 5% (both onto the deeper USDT/USDC 0.05% pool) ─
  {
    symbol: "USDC",
    token: USDC,
    pool: POOL_USDT_USDC_005,
    currentPct: 1,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "uniswap",
    note: `moves off ${POOL_USDT_USDC_001} (USDT/USDC 0.01%) onto USDT/USDC 0.05%; co-trip with USDT on shared pool`,
  },
  {
    symbol: "USDT",
    token: USDT,
    pool: POOL_USDT_USDC_005,
    currentPct: 3,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "uniswap",
    note: `moves off ${POOL_USDT_WBNB_001} (USDT/WBNB 0.01%) onto USDT/USDC 0.05%; removes the WBNB-quote noise source; co-trip with USDC on shared pool`,
  },

  // ── Configuration removals ────────────────────────────────────────────
  // TUSD: disable monitoring. Stored config is left intact (no removal function on the
  // deployed DeviationSentinel; setTokenConfig rejects deviation = 0).
  {
    symbol: "TUSD",
    token: TUSD,
    pool: POOL_TUSD_USDT_001,
    currentPct: 1,
    targetPct: 1,
    action: "disable",
    note: "disable monitoring; config preserved (config-clear needs a contract change — deferred)",
  },
  // DAI: already disabled on-chain by VIP-644 (tokenConfigs = (10, disabled)). No command emitted.
  {
    symbol: "DAI",
    token: DAI,
    pool: POOL_DAI_USDT_001,
    currentPct: 10,
    targetPct: 10,
    action: "skip",
    currentEnabled: false,
    note: "already disabled by VIP-644; config-clear deferred (needs a contract change)",
  },
];
