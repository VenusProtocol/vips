import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { LzChainId } from "src/types";

const { basemainnet } = NETWORK_ADDRESSES;

// Already-deployed governance + protocol addresses on Base mainnet
export const BASEMAINNET_ACM = basemainnet.ACCESS_CONTROL_MANAGER;
export const BASEMAINNET_GUARDIAN = basemainnet.GUARDIAN;
export const BASEMAINNET_NORMAL_TIMELOCK = basemainnet.NORMAL_TIMELOCK;
export const BASEMAINNET_FAST_TRACK_TIMELOCK = basemainnet.FAST_TRACK_TIMELOCK;
export const BASEMAINNET_CRITICAL_TIMELOCK = basemainnet.CRITICAL_TIMELOCK;
export const BASEMAINNET_CORE_COMPTROLLER = basemainnet.CORE_COMPTROLLER;

// PLACEHOLDERS — to be filled once the EBrake/DeviationSentinel stack is deployed on Base
export const BASEMAINNET_DEVIATION_SENTINEL = ZERO_ADDRESS;
export const BASEMAINNET_EBRAKE = ZERO_ADDRESS;
export const BASEMAINNET_SENTINEL_ORACLE = ZERO_ADDRESS;
export const BASEMAINNET_UNISWAP_ORACLE = ZERO_ADDRESS;
export const BASEMAINNET_MULTISIG_PAUSER = ZERO_ADDRESS;
export const BASEMAINNET_KEEPER = ZERO_ADDRESS;

// PLACEHOLDER — first monitored token + its Uniswap V3 pool. Leave as ZERO_ADDRESS to skip token wiring.
export const BASEMAINNET_MONITORED_TOKEN = ZERO_ADDRESS;
export const BASEMAINNET_MONITORED_POOL = ZERO_ADDRESS;
export const BASEMAINNET_DEVIATION_PERCENT = 20;

export const BASEMAINNET_DST_CHAIN_ID = LzChainId.basemainnet;

export const BASEMAINNET_CONFIG = {
  name: "Base",
  dstChainId: BASEMAINNET_DST_CHAIN_ID,
  acm: BASEMAINNET_ACM,
  guardian: BASEMAINNET_GUARDIAN,
  normalTimelock: BASEMAINNET_NORMAL_TIMELOCK,
  fastTrackTimelock: BASEMAINNET_FAST_TRACK_TIMELOCK,
  criticalTimelock: BASEMAINNET_CRITICAL_TIMELOCK,
  comptroller: BASEMAINNET_CORE_COMPTROLLER,
  deviationSentinel: BASEMAINNET_DEVIATION_SENTINEL,
  eBrake: BASEMAINNET_EBRAKE,
  sentinelOracle: BASEMAINNET_SENTINEL_ORACLE,
  uniswapOracle: BASEMAINNET_UNISWAP_ORACLE,
  multisigPauser: BASEMAINNET_MULTISIG_PAUSER,
  keeper: BASEMAINNET_KEEPER,
  monitoredToken: BASEMAINNET_MONITORED_TOKEN,
  monitoredPool: BASEMAINNET_MONITORED_POOL,
  deviationPercent: BASEMAINNET_DEVIATION_PERCENT,
} as const;
