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

// PLACEHOLDERS — to be filled once the EBrake/DeviationSentinel stack is deployed on Arbitrum One
export const ARBITRUMONE_DEVIATION_SENTINEL = ZERO_ADDRESS;
export const ARBITRUMONE_EBRAKE = ZERO_ADDRESS;
export const ARBITRUMONE_SENTINEL_ORACLE = ZERO_ADDRESS;
export const ARBITRUMONE_UNISWAP_ORACLE = ZERO_ADDRESS;
export const ARBITRUMONE_MULTISIG_PAUSER = ZERO_ADDRESS;
export const ARBITRUMONE_KEEPER = ZERO_ADDRESS;

// PLACEHOLDER — first monitored token + its Uniswap V3 pool. Leave as ZERO_ADDRESS to skip token wiring.
export const ARBITRUMONE_MONITORED_TOKEN = ZERO_ADDRESS;
export const ARBITRUMONE_MONITORED_POOL = ZERO_ADDRESS;
export const ARBITRUMONE_DEVIATION_PERCENT = 20;

export const ARBITRUMONE_DST_CHAIN_ID = LzChainId.arbitrumone;

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
  monitoredToken: ARBITRUMONE_MONITORED_TOKEN,
  monitoredPool: ARBITRUMONE_MONITORED_POOL,
  deviationPercent: ARBITRUMONE_DEVIATION_PERCENT,
} as const;
