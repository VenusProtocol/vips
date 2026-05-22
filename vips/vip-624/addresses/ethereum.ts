import type { MarketEntry } from "../config";

// ============================================================
// DeviationSentinel infrastructure on Ethereum mainnet (deployed via VIP-616)
// ============================================================
export const DEVIATION_SENTINEL = "0x7D0EFA41eBF1aF242A37174E1E047bD6ea1b1B9c";
export const SENTINEL_ORACLE = "0x444C53E194B40c272fAd683210e2cB1c16Ab132e";
export const UNISWAP_ORACLE = "0x873993F8f5f5Ddbae0952e939ab3005Af363Af00";
export const CURVE_ORACLE = "0x9F508F3146cb03276282f9237c6eE64f76E3261D";

// ============================================================
// Underlying token addresses (Ethereum mainnet)
// ============================================================
export const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
export const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
export const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const LBTC = "0x8236a87084f8B84306f72007F36F2618A5634494";
export const USDE = "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3";
export const EBTC = "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642";
export const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const TBTC = "0x18084fbA666a33d37592fA2633fD49a74DD93a88";
export const USDS = "0xdC035D45d973E3EC169d2276DDab16f1e407384F";
export const CRVUSD = "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E";
export const EIGEN = "0xec53bF9167f50cDEB3Ae105f56099aaaB9061F83";
export const SUSDE = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
export const SUSDS = "0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD";

// Thin/Not-Eligible tokens (carried in the table only as `skip` entries so the
// market list is self-documenting).
export const TUSD = "0x0000000000085d4780B73119b644AE5ecd22b376";
export const WEETHS = "0xe1B4d34E8754600962Cd944B535180Bd758E6c2e";
export const BAL = "0xba100000625a3754423978a60c9317c58a424e3D";

// ============================================================
// Pool addresses — Ethereum mainnet
// All UniV3 except where noted. Pools verified on-chain via cast call → token0/token1.
// ============================================================
const POOL_WETH_USDC = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"; // UniV3 0.05%
const POOL_WBTC_USDC = "0x99ac8ca7087fa4a2a1fb6357269965a2014abc35"; // UniV3 0.30%
const POOL_USDC_USDT = "0x3416cf6c708da44db2624d63ea0aaef7113527c6"; // UniV3 0.01% (shared USDC/USDT)
const POOL_LBTC_WBTC = "0x87428a53e14d24ab19c6ca4939b4df93b8996ca9"; // UniV3
const POOL_USDE_USDC = "0xe6d7ebb9f1a9519dc06d557e03c522d53520e76a"; // UniV3
const POOL_EBTC_WBTC = "0x7704d01908afd31bf647d969c295bb45230cd2d6"; // wired by VIP-616
const POOL_DAI_USDC = "0x5777d92f208679db4b9778590fa3cab3ac9e2168"; // UniV3
const POOL_TBTC_WETH = "0x97944213d2caeea773da1c9b11b0525f25b749cc"; // UniV3
const POOL_CRVUSD_USDC = "0x4dece678ceceb27446b35c672dc7d61f30bad69e"; // Curve crvUSD/USDC
const POOL_EIGEN_USDC = "0xd640333b71b015092d9b3afcff3e427036304370"; // UniV3 1%
const POOL_SUSDE_USDT = "0x7eb59373d63627be64b42406b108b602174b4ccc"; // UniV3 0.01%

// USDS stays on its existing UniV3 DAI/USDS pool (skipped this VIP).
const POOL_USDS_DAI = "0xe9f1e2ef814f5686c30ce6fb7103d0f780836c67"; // UniV3 (current)
const POOL_SUSDS_USDT = "0x00836fe54625be242bcfa286207795405ca4fd10"; // Curve sUSDS/USDT NG

// ============================================================
// Ethereum market table
// Pre-VIP state (from VIP-616): 10 markets wired at 10%. crvUSD and EIGEN were
// not configured by VIP-616; VIP-624 promotes crvUSD and leaves EIGEN as `skip`.
// USDS is left as `skip` until ResilientOracle has a feed for the candidate
// repoint pool's reference token (PYUSD).
// ============================================================
export const ETHEREUM_MARKETS: MarketEntry[] = [
  // ── Volatile majors: skip (no threshold change, already wired) ────────
  {
    symbol: "WETH",
    token: WETH,
    pool: POOL_WETH_USDC,
    currentPct: 10,
    targetPct: 10,
    action: "skip",
    note: "10% unchanged",
  },

  // ── Stables: retune 10% → 1% ──────────────────────────────────────────
  { symbol: "USDC", token: USDC, pool: POOL_USDC_USDT, currentPct: 10, targetPct: 1, action: "retune" },
  {
    symbol: "USDT",
    token: USDT,
    pool: POOL_USDC_USDT,
    currentPct: 10,
    targetPct: 1,
    action: "retune",
    note: "co-trip with USDC on shared pool",
  },
  { symbol: "USDe", token: USDE, pool: POOL_USDE_USDC, currentPct: 10, targetPct: 1, action: "retune" },
  {
    symbol: "DAI",
    token: DAI,
    pool: POOL_DAI_USDC,
    currentPct: 10,
    targetPct: 1,
    action: "retune",
    note: "Delist rec (handled separately)",
  },

  // ── Wrapped / ratio-fed: retune 10% → 3% ──────────────────────────────
  { symbol: "WBTC", token: WBTC, pool: POOL_WBTC_USDC, currentPct: 10, targetPct: 3, action: "retune" },
  { symbol: "LBTC", token: LBTC, pool: POOL_LBTC_WBTC, currentPct: 10, targetPct: 3, action: "retune" },
  { symbol: "eBTC", token: EBTC, pool: POOL_EBTC_WBTC, currentPct: 10, targetPct: 3, action: "retune" },
  {
    symbol: "tBTC",
    token: TBTC,
    pool: POOL_TBTC_WETH,
    currentPct: 10,
    targetPct: 3,
    action: "retune",
    note: "Delist rec (handled separately)",
  },

  // ── USDS: skip (candidate repoint deferred) ──
  // Current wiring (UniV3 DAI/USDS, 10%) is below the $250K depth gate, but the
  // candidate replacement (Curve PYUSD/USDS) prices against PYUSD, which has no
  // feed in ResilientOracle on Ethereum — `checkPriceDeviation` would revert.
  // Revisit once PYUSD is onboarded into ResilientOracle.
  {
    symbol: "USDS",
    token: USDS,
    pool: POOL_USDS_DAI,
    currentPct: 10,
    targetPct: 10,
    action: "skip",
    note: "deferred: candidate Curve PYUSD/USDS pool requires PYUSD feed in ResilientOracle",
  },

  // ── Promotions (not currently wired; full new wire — 3 calls each) ────
  // sUSDe / sUSDS: ERC-4626 wrappers — no underlying-quoted pool exists; the
  // USDT-quoted pools introduce a USDT-pricing dependency (mirrors USDS repoint).
  {
    symbol: "crvUSD",
    token: CRVUSD,
    pool: POOL_CRVUSD_USDC,
    currentPct: 0,
    targetPct: 1,
    action: "promote",
    oracleType: "curve",
    coinIndex: 1, // crvUSD sits at coins(1) on the Curve pool
    refCoinIndex: 0, // USDC sits at coins(0)
    referenceToken: USDC,
    assetDecimals: 18,
    note: "VIP-616 excluded; promoted in VIP-624 via Curve crvUSD/USDC pool",
  },
  {
    symbol: "EIGEN",
    token: EIGEN,
    pool: POOL_EIGEN_USDC,
    currentPct: 0,
    targetPct: 0,
    action: "skip",
    note: "already delisted; no on-chain action",
  },
  {
    symbol: "sUSDe",
    token: SUSDE,
    pool: POOL_SUSDE_USDT,
    currentPct: 0,
    targetPct: 1,
    action: "promote",
    oracleType: "uniswap",
    note: "ERC-4626; binds USDT-quoted pool — introduces USDT-pricing dependency",
  },
  {
    symbol: "sUSDS",
    token: SUSDS,
    pool: POOL_SUSDS_USDT,
    currentPct: 0,
    targetPct: 1,
    action: "promote",
    oracleType: "curve",
    coinIndex: 0, // sUSDS sits at coins(0)
    refCoinIndex: 1, // USDT sits at coins(1)
    referenceToken: USDT,
    assetDecimals: 18,
    note: "ERC-4626; binds USDT-quoted Curve pool — introduces USDT-pricing dependency",
  },

  // ── Thin / Not-Eligible — carried for spec preservation, no on-chain action ──
  // Each has a separate Delist recommendation; tracked outside VIP-624.
  {
    symbol: "TUSD",
    token: TUSD,
    pool: "0x39529e96c28807655b5856b3d342c6225111770e",
    currentPct: 0,
    targetPct: 0,
    action: "skip",
    note: "Thin pool $517 — Delist rec",
  },
  {
    symbol: "weETHs",
    token: WEETHS,
    pool: "0x174eff1363c4b446f3425315bd6c12f305823d6a",
    currentPct: 0,
    targetPct: 0,
    action: "skip",
    note: "Thin pool $0 — Delist rec",
  },
  {
    symbol: "BAL",
    token: BAL,
    pool: "0x0000000000000000000000000000000000000000",
    currentPct: 0,
    targetPct: 0,
    action: "skip",
    note: "Not Eligible — only Balancer V2 depth ($6.04M); Delist rec",
  },
];
