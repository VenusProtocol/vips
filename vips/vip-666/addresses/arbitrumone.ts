import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { LzChainId } from "src/types";

const { arbitrumone } = NETWORK_ADDRESSES;

// Already-deployed governance + protocol addresses on Arbitrum One
export const ARBITRUMONE_ACM = arbitrumone.ACCESS_CONTROL_MANAGER;
export const ARBITRUMONE_GUARDIAN = arbitrumone.GUARDIAN;
export const ARBITRUMONE_NORMAL_TIMELOCK = arbitrumone.NORMAL_TIMELOCK;
export const ARBITRUMONE_FAST_TRACK_TIMELOCK = arbitrumone.FAST_TRACK_TIMELOCK;
export const ARBITRUMONE_CRITICAL_TIMELOCK = arbitrumone.CRITICAL_TIMELOCK;
export const ARBITRUMONE_CORE_COMPTROLLER = arbitrumone.CORE_COMPTROLLER;

// Deployed via venus-periphery PR #65 (feat/VPD-1134)
export const ARBITRUMONE_DEVIATION_SENTINEL = "0xb4CC54B33d34fD809E8fBD83A066158591ED7Fba";
export const ARBITRUMONE_EBRAKE = "0xFc4CE7Ca9BB5119705Cfb84d6e4476e8a4032b26";
export const ARBITRUMONE_SENTINEL_ORACLE = "0x3563CAbc541a0432C66A64942ffB4070a9726226";
export const ARBITRUMONE_UNISWAP_ORACLE = "0xB6CFbfe6834EF519f002DBc1a8B81Ea437Ca647D";
export const ARBITRUMONE_MULTISIG_PAUSER = "0xCCa5a587eBDBe80f23c8610F2e53B03158e62948"; // Venus team multisig
export const ARBITRUMONE_KEEPER = "0x57fa23f591203f61cef84a7bc892df69ca95c86e";

export const ARBITRUMONE_DST_CHAIN_ID = LzChainId.arbitrumone;

// Eligible Core Pool markets — Uniswap V3 (Arbitrum) sources, unified 10% threshold.
// USD₮0 (Tether's bridged T-zero USDT) and the legacy USDT pool share the same
// USDC/USDT pool address per market spec. USD₮0 token address is left as a TODO
// placeholder — confirm and fill before proposing.
export const ARBITRUMONE_MONITORED_MARKETS = [
  {
    symbol: "WETH",
    token: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    pool: "0xc6962004f452be9203591991d15f6b388e09e8d0", // WETH/USDC Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "WBTC",
    token: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    pool: "0x0e4831319a50228b9e450861297ab92dee15b44f", // WBTC/USDC Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "USDC",
    token: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    pool: "0xbe3ad6a5669dc0b8b12febc03608860c31e2eef6", // USDC/USDT Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "USD₮0",
    token: ZERO_ADDRESS, // TODO: confirm USD₮0 token address on Arbitrum One
    pool: "0xbe3ad6a5669dc0b8b12febc03608860c31e2eef6", // USD₮0/USDC Uniswap V3
    deviationPercent: 10,
  },
  {
    symbol: "ARB",
    token: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    pool: "0xaebdca1bc8d89177ebe2308d62af5e74885dccc3", // ARB/USDC Uniswap V3
    deviationPercent: 10,
  },
];

export const ARBITRUMONE_CONFIG = {
  name: "Arbitrum One",
  dstChainId: ARBITRUMONE_DST_CHAIN_ID,
  acm: ARBITRUMONE_ACM,
  guardian: ARBITRUMONE_GUARDIAN,
  normalTimelock: ARBITRUMONE_NORMAL_TIMELOCK,
  fastTrackTimelock: ARBITRUMONE_FAST_TRACK_TIMELOCK,
  criticalTimelock: ARBITRUMONE_CRITICAL_TIMELOCK,
  comptroller: ARBITRUMONE_CORE_COMPTROLLER,
  deviationSentinel: ARBITRUMONE_DEVIATION_SENTINEL,
  eBrake: ARBITRUMONE_EBRAKE,
  sentinelOracle: ARBITRUMONE_SENTINEL_ORACLE,
  uniswapOracle: ARBITRUMONE_UNISWAP_ORACLE,
  multisigPauser: ARBITRUMONE_MULTISIG_PAUSER,
  keeper: ARBITRUMONE_KEEPER,
  monitoredMarkets: ARBITRUMONE_MONITORED_MARKETS,
} as const;
