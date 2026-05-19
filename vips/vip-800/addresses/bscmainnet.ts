import type { MarketEntry } from "../config";

// ============================================================
// DeviationSentinel infrastructure on BSC mainnet (deployed in VIP-590)
// ============================================================
export const DEVIATION_SENTINEL = "0x6599C15cc8407046CD91E5c0F8B7f765fF914870";
export const SENTINEL_ORACLE = "0x58eae0Cf4215590E19860b66b146C5d539cb6f14";
export const PANCAKESWAP_ORACLE = "0x44B72078240A3509979faF450085Fa818401D32E";

// ============================================================
// Underlying token addresses (BSC mainnet)
// Re-exported here as the source of truth for VIP-800 — task.md's pool / token
// table is mirrored below in BSC_MARKETS so the spec survives task.md deletion.
// ============================================================
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const U = "0xcE24439F2D9C6a2289F741120FE202248B666666";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const CAKE = "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82";
export const SOLVBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
export const USD1 = "0x8d0D000Ee44948FC98c9B98A4FA4921476f08B0d";
export const SLISBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const WBETH = "0xa2e3356610840701bdf5611a53974510ae27e2e1";
export const XRP = "0x1D2F0da169ceB9fC7B3144628dB156f3F6c60dBE";
export const SOL = "0x570A5D26f7765Ecb712C0924E4De545B89fD43dF";
export const TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
export const LINK = "0xF8A0BF9cF54Bb92F17374d9e9A321E6a111a51bD";
export const DOGE = "0xbA2aE424d960c26247Dd6c32edC70B295c744C43";
export const TWT = "0x4B0F1812e5Df2A09796481Ff14017e6005508003";
export const XAUM = "0x23AE4fd8E7844cdBc97775496eBd0E8248656028";
export const ADA = "0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47";
export const LISUSD = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
export const LTC = "0x4338665CBB7B2485A8855A139b75D5e34AB0DB94";
export const TRX = "0xCE7de646e7208a4Ef112cb6ed5038FA6cC6b12e3";
export const FDUSD = "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409";
export const UNI = "0xBf5140A22578168FD562DCcF235E5D43A02ce9B1";
export const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
export const DOT = "0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402";
export const FIL = "0x0D8Ce2A99Bb6e3B7Db580eD848240e4a0F9aE153";
export const BCH = "0x8fF795a6F4D97E7887C79beA79aba5cc76444aDf";
export const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";

// ============================================================
// PancakeSwap V3 pool addresses
// (mirrors vips/vip-613/config.ts; pool selection is unchanged in VIP-800)
// ============================================================
const POOL_USDT_USDC_001 = "0x92b7807bf19b7dddf89b706143896d05228f3121";
const POOL_U_USDT_001 = "0xa0909f81785f87f3e79309f0e73a7d82208094e4";
// USDT and WBNB share this pool — asymmetric tiers (1% USDT vs 10% WBNB) mean any
// shared-pool deviation event trips USDT first. Documented co-trip per task spec.
const POOL_USDT_WBNB_001 = "0x172fcd41e0913e95784454622d1c3724f546f849";
const POOL_BTCB_WBNB_005 = "0x6bbc40579ad1bbd243895ca0acb086bb6300d636";
const POOL_ETH_WBNB_005 = "0xd0e226f674bbf064f54ab47f42473ff80db98cba";
const POOL_CAKE_WBNB_025 = "0x133b3d95bad5405d14d53473671200e9342896bf";
const POOL_SOLVBTC_BTCB_005 = "0x12197d7a4fe2d67f9f97ae64d82a44c24b7ad407";
const POOL_USD1_USDT_001 = "0x9c4ee895e4f6ce07ada631c508d1306db7502cce";
const POOL_SLISBNB_WBNB_005 = "0x9474e972f49605315763c296b122cbb998b615cf";
const POOL_WBETH_ETH_005 = "0x379044e32f5a162233e82de19da852255d0951b8";
const POOL_XRP_USDT_025 = "0x71f5a8f7d448e59b1ede00a19fe59e05d125e742";
const POOL_SOL_WBNB_005 = "0xbffec96e8f3b5058b1817c14e4380758fada01ef";
const POOL_TUSD_USDT_001 = "0xd881d9d0e0767719701305c614903f555d589586";
const POOL_LINK_WBNB_025 = "0x0e1893beeb4d0913d26b9614b18aea29c56d94b9";
const POOL_DOGE_WBNB_025 = "0xce6160bb594fc055c943f59de92cee30b8c6b32c";
const POOL_TWT_WBNB_025 = "0x8ccb4544b3030dacf3d4d71c658f04e8688e25b1";
const POOL_XAUM_USDT_005 = "0x497e224d7008fe47349035ddd98bedb773e1f4c5";
const POOL_ADA_USDT_025 = "0x29c5ba7dbb67a4af999a28cc380ad234fe7c1b86";
const POOL_LISUSD_USDT_005 = "0x12e79eb21dcc5852f9c6ac1736d977312925da33";
const POOL_LTC_WBNB_025 = "0xe3cbe4dd1bd2f7101f17d586f44bab944091d383";
const POOL_TRX_WBNB_025 = "0xf683113764e4499c473acd38fc4b37e71554e4ad";
const POOL_FDUSD_USDT_001 = "0xbf72b6485e4b31601afe7b0a1210be2004d2b1d6";
const POOL_UNI_WBNB_025 = "0x647d99772863e09f47435782cbb6c96ec4a75f12";
const POOL_DAI_USDT_001 = "0xe043558b77e2b4c262d7d6e579b005ceb7f4591c";
const POOL_DOT_WBNB_025 = "0x62f0546cbcd684f7c394d8549119e072527c41bc";
const POOL_FIL_WBNB_005 = "0x16d7c51e9c59be9f18b19b608d53b37fa9890b8a";
const POOL_BCH_WBNB_025 = "0x14cfad9a4fcb5fb4f702f5d0e90dcc633e1ded9a";
const POOL_XVS_WBNB_025 = "0x77d5b2560e4b84b3fc58875cb0133f39560e8ae3";

// ============================================================
// Full BSC market table (29 entries from task spec)
// Pre-VIP state: VIP-613 wired 25 markets at 10% (everything except the 4 pending-delist
// pairs TWT/DOT/FIL/BCH, which were never configured). CAKE's on-chain threshold is 20%
// per VIP-590; VIP-613 (queued ahead of VIP-800) tightens it to 10% before VIP-800 runs.
// ============================================================
export const BSC_MARKETS: MarketEntry[] = [
  // ── Stables: retune 10% → 1% ──────────────────────────────────────────
  { symbol: "USDC", token: USDC, pool: POOL_USDT_USDC_001, currentPct: 10, targetPct: 1, action: "retune" },
  { symbol: "U", token: U, pool: POOL_U_USDT_001, currentPct: 10, targetPct: 1, action: "retune" },
  {
    symbol: "USDT",
    token: USDT,
    pool: POOL_USDT_WBNB_001,
    currentPct: 10,
    targetPct: 1,
    action: "retune",
    note: "co-trip with WBNB on shared pool",
  },
  { symbol: "USD1", token: USD1, pool: POOL_USD1_USDT_001, currentPct: 10, targetPct: 1, action: "retune" },
  { symbol: "TUSD", token: TUSD, pool: POOL_TUSD_USDT_001, currentPct: 10, targetPct: 1, action: "retune" },
  { symbol: "lisUSD", token: LISUSD, pool: POOL_LISUSD_USDT_005, currentPct: 10, targetPct: 1, action: "retune" },

  // ── Ratio-fed wrappers / LSTs: retune 10% → 3% ────────────────────────
  { symbol: "solvBTC", token: SOLVBTC, pool: POOL_SOLVBTC_BTCB_005, currentPct: 10, targetPct: 3, action: "retune" },
  { symbol: "slisBNB", token: SLISBNB, pool: POOL_SLISBNB_WBNB_005, currentPct: 10, targetPct: 3, action: "retune" },
  { symbol: "wBETH", token: WBETH, pool: POOL_WBETH_ETH_005, currentPct: 10, targetPct: 3, action: "retune" },

  // ── Volatile majors: target 10% (no-op writes skipped) ────────────────
  // All 10% markets are already wired by VIP-613, including CAKE (VIP-590 set CAKE
  // to 20%; VIP-613 tightened it to 10%, which has executed on mainnet). WBNB inherits
  // a 1% co-trip via the shared USDT/WBNB pool.
  {
    symbol: "WBNB",
    token: WBNB,
    pool: POOL_USDT_WBNB_001,
    currentPct: 10,
    targetPct: 10,
    action: "skip",
    note: "10% unchanged; co-trip exposure via shared pool with USDT (1%)",
  },
  { symbol: "BTCB", token: BTCB, pool: POOL_BTCB_WBNB_005, currentPct: 10, targetPct: 10, action: "skip" },
  { symbol: "ETH", token: ETH, pool: POOL_ETH_WBNB_005, currentPct: 10, targetPct: 10, action: "skip" },
  {
    symbol: "CAKE",
    token: CAKE,
    pool: POOL_CAKE_WBNB_025,
    currentPct: 10,
    targetPct: 10,
    action: "skip",
    note: "10% unchanged (VIP-613 already retuned CAKE 20% → 10%)",
  },
  { symbol: "XRP", token: XRP, pool: POOL_XRP_USDT_025, currentPct: 10, targetPct: 10, action: "skip" },
  { symbol: "SOL", token: SOL, pool: POOL_SOL_WBNB_005, currentPct: 10, targetPct: 10, action: "skip" },
  { symbol: "LINK", token: LINK, pool: POOL_LINK_WBNB_025, currentPct: 10, targetPct: 10, action: "skip" },
  { symbol: "DOGE", token: DOGE, pool: POOL_DOGE_WBNB_025, currentPct: 10, targetPct: 10, action: "skip" },
  { symbol: "XAUM", token: XAUM, pool: POOL_XAUM_USDT_005, currentPct: 10, targetPct: 10, action: "skip" },
  { symbol: "ADA", token: ADA, pool: POOL_ADA_USDT_025, currentPct: 10, targetPct: 10, action: "skip" },
  { symbol: "LTC", token: LTC, pool: POOL_LTC_WBNB_025, currentPct: 10, targetPct: 10, action: "skip" },

  // ── Excluded — pending delist, never wired by VIP-613 ─────────────────
  {
    symbol: "TWT",
    token: TWT,
    pool: POOL_TWT_WBNB_025,
    currentPct: 0,
    targetPct: 0,
    action: "skip",
    note: "pending delist; never configured by VIP-613",
  },
  {
    symbol: "DOT",
    token: DOT,
    pool: POOL_DOT_WBNB_025,
    currentPct: 0,
    targetPct: 0,
    action: "skip",
    note: "pending delist; never configured by VIP-613",
  },
  {
    symbol: "FIL",
    token: FIL,
    pool: POOL_FIL_WBNB_005,
    currentPct: 0,
    targetPct: 0,
    action: "skip",
    note: "pending delist; never configured by VIP-613",
  },
  {
    symbol: "BCH",
    token: BCH,
    pool: POOL_BCH_WBNB_025,
    currentPct: 0,
    targetPct: 0,
    action: "skip",
    note: "pending delist; never configured by VIP-613",
  },

  // ── Deferred — wired at 10% by VIP-613 but pool TVL is below $250K gate ─
  // Disable monitoring (and zero the threshold as fail-safe). A future VIP can
  // re-enable at the appropriate tier once pool depth crosses the gate.
  {
    symbol: "TRX",
    token: TRX,
    pool: POOL_TRX_WBNB_025,
    currentPct: 10,
    targetPct: 10,
    action: "disable",
    note: "TVL $201K < $250K gate",
  },
  {
    symbol: "FDUSD",
    token: FDUSD,
    pool: POOL_FDUSD_USDT_001,
    currentPct: 10,
    targetPct: 10,
    action: "disable",
    note: "TVL $127K < $250K gate",
  },
  {
    symbol: "UNI",
    token: UNI,
    pool: POOL_UNI_WBNB_025,
    currentPct: 10,
    targetPct: 10,
    action: "disable",
    note: "TVL $132K < $250K gate",
  },
  {
    symbol: "DAI",
    token: DAI,
    pool: POOL_DAI_USDT_001,
    currentPct: 10,
    targetPct: 10,
    action: "disable",
    note: "TVL $130K < $250K gate",
  },
  {
    symbol: "XVS",
    token: XVS,
    pool: POOL_XVS_WBNB_025,
    currentPct: 10,
    targetPct: 10,
    action: "disable",
    note: "TVL $133K < $250K gate",
  },
];
