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
export const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
export const TBTC = "0x18084fbA666a33d37592fA2633fD49a74DD93a88";
export const USDS = "0xdC035D45d973E3EC169d2276DDab16f1e407384F";
export const CRVUSD = "0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E";
export const SUSDE = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";
export const SUSDS = "0xa3931d71877C0E7a3148CB7Eb4463524FEc27fbD";

// ============================================================
// Pool addresses — Ethereum mainnet
// All coin indexes / token0-token1 verified on-chain (2026-08-26).
// ============================================================
// Current pools (carried for documentation only).
const POOL_USDC_USDT_UNI = "0x3416cf6c708da44db2624d63ea0aaef7113527c6"; // current USDC/USDT
const POOL_DAI_USDC_UNI = "0x5777d92f208679db4b9778590fa3cab3ac9e2168"; // current DAI
const POOL_CRVUSD_USDC_CURVE = "0x4dece678ceceb27446b35c672dc7d61f30bad69e"; // current crvUSD
const POOL_SUSDE_USDT_UNI = "0x7eb59373d63627be64b42406b108b602174b4ccc"; // current sUSDe
const POOL_SUSDS_USDT_CURVE = "0x00836fe54625be242bcfa286207795405ca4fd10"; // current sUSDS
const POOL_WBTC_USDC_UNI = "0x99ac8ca7087fa4a2a1fb6357269965a2014abc35"; // current WBTC
const POOL_LBTC_WBTC_UNI = "0x87428a53e14d24ab19c6ca4939b4df93b8996ca9"; // current LBTC
const POOL_WBTC_TBTC_UNI = "0x73a38006d23517a1d383c88929b2014f8835b38b"; // current tBTC
const POOL_WETH_USDC_UNI = "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"; // current WETH

// Target pools (V2 doc).
// Curve 3pool — coins(0)=DAI, coins(1)=USDC, coins(2)=USDT.
const POOL_CURVE_3POOL = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
// Curve USDT/crvUSD — coins(0)=USDT, coins(1)=crvUSD.
const POOL_CURVE_USDT_CRVUSD = "0x390f3595bCa2Df7d23783dFd126427CCeb997BF4";
// Curve crvUSD/sUSDe — coins(0)=crvUSD, coins(1)=sUSDe.
const POOL_CURVE_CRVUSD_SUSDE = "0x57064F49Ad7123C92560882a45518374ad982e85";
// Curve sUSDe/sUSDS — coins(0)=sUSDe, coins(1)=sUSDS.
const POOL_CURVE_SUSDE_SUSDS = "0x3CEf1AFC0E8324b57293a6E7cE663781bbEFBB79";
// Curve WBTC/tBTC — coins(0)=WBTC, coins(1)=tBTC.
const POOL_CURVE_WBTC_TBTC = "0xB7ECB2AA52AA64a717180E030241bC75Cd946726";
// Uniswap V3 USDT/WBTC 0.30% — token0 = WBTC, token1 = USDT.
const POOL_WBTC_USDT_030 = "0x9Db9e0e53058C89e5B94e29621a205198648425B";
// Uniswap V3 WBTC/LBTC 0.01% — token0 = WBTC, token1 = LBTC.
const POOL_WBTC_LBTC_001 = "0x0b599ebf4E05af48b56D38E2DDe520570C366460";
// Uniswap V3 WETH/USDT 0.30% — token0 = WETH, token1 = USDT.
const POOL_WETH_USDT_030 = "0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36";

// ============================================================
// Ethereum market table
// currentPct verified on-chain (2026-08-26): USDC/USDT/USDe/DAI/crvUSD/sUSDe/sUSDS = 1%,
// WBTC/LBTC/tBTC = 3%, USDS = 10%, WETH = 10%. sUSDe/sUSDS were wired by VIP-624.
// ============================================================
export const ETHEREUM_MARKETS: MarketEntry[] = [
  // ── Pool move + retune → 5% (Curve 3pool for the core stables) ─────────
  {
    symbol: "USDC",
    token: USDC,
    pool: POOL_CURVE_3POOL,
    currentPct: 1,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "curve",
    coinIndex: 1, // USDC = coins(1)
    refCoinIndex: 2, // USDT = coins(2)
    referenceToken: USDT,
    assetDecimals: 6,
    note: `moves off ${POOL_USDC_USDT_UNI} (Uni V3 USDC/USDT) onto Curve 3pool; co-trip with USDT/DAI on shared pool`,
  },
  {
    symbol: "USDT",
    token: USDT,
    pool: POOL_CURVE_3POOL,
    currentPct: 1,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "curve",
    coinIndex: 2, // USDT = coins(2)
    refCoinIndex: 1, // USDC = coins(1)
    referenceToken: USDC,
    assetDecimals: 6,
    note: `moves off ${POOL_USDC_USDT_UNI} (Uni V3 USDC/USDT) onto Curve 3pool; co-trip with USDC/DAI on shared pool`,
  },
  {
    symbol: "USDe",
    token: USDE,
    pool: "0xe6d7ebb9f1a9519dc06d557e03c522d53520e76a",
    currentPct: 1,
    targetPct: 5,
    action: "retune",
    note: "threshold only (pool unchanged in V2 doc)",
  },
  {
    symbol: "DAI",
    token: DAI,
    pool: POOL_CURVE_3POOL,
    currentPct: 1,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "curve",
    coinIndex: 0, // DAI = coins(0)
    refCoinIndex: 1, // USDC = coins(1)
    referenceToken: USDC,
    assetDecimals: 18,
    note: `moves off ${POOL_DAI_USDC_UNI} (Uni V3 DAI/USDC) onto Curve 3pool; co-trip with USDC/USDT on shared pool`,
  },
  {
    symbol: "crvUSD",
    token: CRVUSD,
    pool: POOL_CURVE_USDT_CRVUSD,
    currentPct: 1,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "curve",
    coinIndex: 1, // crvUSD = coins(1)
    refCoinIndex: 0, // USDT = coins(0)
    referenceToken: USDT,
    assetDecimals: 18,
    skipOracleRepoint: true, // SentinelOracle already routes to the target CurveOracle (verified on-chain)
    note: `moves off ${POOL_CRVUSD_USDC_CURVE} (Curve crvUSD/USDC) onto Curve USDT/crvUSD`,
  },
  {
    symbol: "sUSDe",
    token: SUSDE,
    pool: POOL_CURVE_CRVUSD_SUSDE,
    currentPct: 1,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "curve",
    coinIndex: 1, // sUSDe = coins(1)
    refCoinIndex: 0, // crvUSD = coins(0)
    referenceToken: CRVUSD,
    assetDecimals: 18,
    note: `moves off ${POOL_SUSDE_USDT_UNI} (Uni V3 USDT/sUSDe) onto Curve crvUSD/sUSDe`,
  },
  {
    symbol: "sUSDS",
    token: SUSDS,
    pool: POOL_CURVE_SUSDE_SUSDS,
    currentPct: 1,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "curve",
    coinIndex: 1, // sUSDS = coins(1)
    refCoinIndex: 0, // sUSDe = coins(0)
    referenceToken: SUSDE,
    assetDecimals: 18,
    skipOracleRepoint: true, // SentinelOracle already routes to the target CurveOracle (verified on-chain)
    note: `moves off ${POOL_SUSDS_USDT_CURVE} (Curve sUSDS/USDT) onto Curve sUSDe/sUSDS`,
  },

  // ── Pool move + retune → 5% (BTC markets) ─────────────────────────────
  {
    symbol: "WBTC",
    token: WBTC,
    pool: POOL_WBTC_USDT_030,
    currentPct: 3,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "uniswap",
    skipOracleRepoint: true, // SentinelOracle already routes to the target UniswapOracle (verified on-chain)
    note: `moves off ${POOL_WBTC_USDC_UNI} (Uni V3 WBTC/USDC 0.30%) onto Uni V3 USDT/WBTC 0.30%`,
  },
  {
    symbol: "LBTC",
    token: LBTC,
    pool: POOL_WBTC_LBTC_001,
    currentPct: 3,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "uniswap",
    skipOracleRepoint: true, // SentinelOracle already routes to the target UniswapOracle (verified on-chain)
    note: `moves off ${POOL_LBTC_WBTC_UNI} (Uni V3 WBTC/LBTC 0.05%) onto the deeper WBTC/LBTC 0.01%`,
  },
  {
    symbol: "tBTC",
    token: TBTC,
    pool: POOL_CURVE_WBTC_TBTC,
    currentPct: 3,
    targetPct: 5,
    action: "poolSwap",
    oracleType: "curve",
    coinIndex: 1, // tBTC = coins(1)
    refCoinIndex: 0, // WBTC = coins(0)
    referenceToken: WBTC,
    assetDecimals: 18,
    note: `moves off ${POOL_WBTC_TBTC_UNI} (Uni V3 WBTC/tBTC 0.01%) onto Curve WBTC/tBTC`,
  },

  // ── Retune → 5% (USDS previously kept at 10%) ─────────────────────────
  {
    symbol: "USDS",
    token: USDS,
    pool: "0xe9f1e2ef814f5686c30ce6fb7103d0f780836c67",
    currentPct: 10,
    targetPct: 5,
    action: "retune",
    note: "threshold only (pool unchanged in V2 doc)",
  },

  // ── Pool move only (threshold left at 10%; not in the doc's threshold table) ──
  {
    symbol: "WETH",
    token: WETH,
    pool: POOL_WETH_USDT_030,
    currentPct: 10,
    targetPct: 10,
    action: "poolOnly",
    oracleType: "uniswap",
    skipOracleRepoint: true, // SentinelOracle already routes to the target UniswapOracle (verified on-chain)
    note: `moves off ${POOL_WETH_USDC_UNI} (Uni V3 USDC/WETH 0.05%) onto Uni V3 WETH/USDT 0.30%; threshold unchanged`,
  },
];
