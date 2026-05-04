import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { LzChainId } from "src/types";

import type { ChainConfig } from "../bscmainnet";

const { ethereum } = NETWORK_ADDRESSES;

// Already-deployed governance + protocol addresses on Ethereum mainnet
export const ETHEREUM_ACM = ethereum.ACCESS_CONTROL_MANAGER;
export const ETHEREUM_GUARDIAN = ethereum.GUARDIAN;
export const ETHEREUM_NORMAL_TIMELOCK = ethereum.NORMAL_TIMELOCK;
export const ETHEREUM_FAST_TRACK_TIMELOCK = ethereum.FAST_TRACK_TIMELOCK;
export const ETHEREUM_CRITICAL_TIMELOCK = ethereum.CRITICAL_TIMELOCK;
export const ETHEREUM_CORE_COMPTROLLER = ethereum.CORE_COMPTROLLER;

// Deployed via venus-periphery PR #65 (feat/VPD-1134)
export const ETHEREUM_DEVIATION_SENTINEL = "0x7D0EFA41eBF1aF242A37174E1E047bD6ea1b1B9c";
export const ETHEREUM_EBRAKE = "0xCD09042c5DFFed762998Df9a058ec5944e39949B";
export const ETHEREUM_SENTINEL_ORACLE = "0x444C53E194B40c272fAd683210e2cB1c16Ab132e";
export const ETHEREUM_UNISWAP_ORACLE = "0x873993F8f5f5Ddbae0952e939ab3005Af363Af00";
// Deployed via venus-periphery PR #66 — prices Curve StableSwap-NG assets that
// UniswapOracle can't read (eBTC/WBTC pool, etc.).
export const ETHEREUM_CURVE_ORACLE = "0x9F508F3146cb03276282f9237c6eE64f76E3261D";
export const ETHEREUM_MULTISIG_PAUSER = "0xCCa5a587eBDBe80f23c8610F2e53B03158e62948"; // Venus team multisig
export const ETHEREUM_KEEPER = "0x57fa23f591203f61cef84a7bc892df69ca95c86e";

// Reference token for eBTC's CurveOracle entry — see CurveOracle.sol for the pricing math.
const WBTC = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

export const ETHEREUM_DST_CHAIN_ID = LzChainId.ethereum;

// Eligible Core Pool markets — Uniswap V3 sources except eBTC (CurveOracle).
// Unified 10% threshold. crvUSD and EIGEN are intentionally excluded per market spec.
export const ETHEREUM_MONITORED_MARKETS = [
  {
    symbol: "WETH",
    token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    pool: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640", // WETH/USDC Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "WBTC",
    token: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    pool: "0x99ac8ca7087fa4a2a1fb6357269965a2014abc35", // WBTC/USDC Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "USDC",
    token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    pool: "0x3416cf6c708da44db2624d63ea0aaef7113527c6", // USDC/USDT Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "USDT",
    token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    pool: "0x3416cf6c708da44db2624d63ea0aaef7113527c6", // USDC/USDT Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "LBTC",
    token: "0x8236a87084f8B84306f72007F36F2618A5634494",
    pool: "0x87428a53e14d24ab19c6ca4939b4df93b8996ca9", // LBTC/WBTC Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "USDe",
    token: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3",
    pool: "0xe6d7ebb9f1a9519dc06d557e03c522d53520e76a", // USDe/USDC Uniswap V3
    deviationPercent: 10,
  },
  // eBTC routes through CurveOracle (eBTC/WBTC StableSwap-NG pool).
  // coinIndex=0 (eBTC is coins[0]), refCoinIndex=1 (WBTC is coins[1]).
  // assetDecimals=8 matches eBTC's ERC-20 decimals; get_dy probes 10^8 units.
  {
    symbol: "eBTC",
    token: "0x657e8C867D8B37dCC18fA4Caead9C45EB088C642",
    pool: "0x7704d01908afd31bf647d969c295bb45230cd2d6",
    deviationPercent: 10,
    oracleType: "curve" as const,
    coinIndex: 0,
    refCoinIndex: 1,
    referenceToken: WBTC,
    assetDecimals: 8,
  },
  {
    symbol: "DAI",
    token: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    pool: "0x5777d92f208679db4b9778590fa3cab3ac9e2168", // DAI/USDC Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "tBTC",
    token: "0x18084fbA666a33d37592fA2633fD49a74DD93a88",
    pool: "0x97944213d2caeea773da1c9b11b0525f25b749cc", // tBTC/WETH Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "USDS",
    token: "0xdC035D45d973E3EC169d2276DDab16f1e407384F",
    pool: "0xe9f1e2ef814f5686c30ce6fb7103d0f780836c67", // USDS/DAI Uniswap V3
    deviationPercent: 10,
  },
];

export const ETHEREUM_CONFIG = {
  name: "Ethereum",
  dstChainId: ETHEREUM_DST_CHAIN_ID,
  acm: ETHEREUM_ACM,
  guardian: ETHEREUM_GUARDIAN,
  normalTimelock: ETHEREUM_NORMAL_TIMELOCK,
  fastTrackTimelock: ETHEREUM_FAST_TRACK_TIMELOCK,
  criticalTimelock: ETHEREUM_CRITICAL_TIMELOCK,
  comptroller: ETHEREUM_CORE_COMPTROLLER,
  deviationSentinel: ETHEREUM_DEVIATION_SENTINEL,
  eBrake: ETHEREUM_EBRAKE,
  sentinelOracle: ETHEREUM_SENTINEL_ORACLE,
  uniswapOracle: ETHEREUM_UNISWAP_ORACLE,
  curveOracle: ETHEREUM_CURVE_ORACLE,
  multisigPauser: ETHEREUM_MULTISIG_PAUSER,
  keeper: ETHEREUM_KEEPER,
  monitoredMarkets: ETHEREUM_MONITORED_MARKETS,
  configurator: ZERO_ADDRESS, // TODO: deploy DeviationSentinelConfiguratorEthereum and update
} satisfies ChainConfig;
