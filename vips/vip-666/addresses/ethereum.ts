import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { LzChainId } from "src/types";

const { ethereum } = NETWORK_ADDRESSES;

// Already-deployed governance + protocol addresses on Ethereum mainnet
export const ETHEREUM_ACM = ethereum.ACCESS_CONTROL_MANAGER;
export const ETHEREUM_GUARDIAN = ethereum.GUARDIAN;
export const ETHEREUM_NORMAL_TIMELOCK = ethereum.NORMAL_TIMELOCK;
export const ETHEREUM_FAST_TRACK_TIMELOCK = ethereum.FAST_TRACK_TIMELOCK;
export const ETHEREUM_CRITICAL_TIMELOCK = ethereum.CRITICAL_TIMELOCK;
export const ETHEREUM_CORE_COMPTROLLER = ethereum.CORE_COMPTROLLER;

// PLACEHOLDERS — to be filled once the EBrake/DeviationSentinel stack is deployed on Ethereum
export const ETHEREUM_DEVIATION_SENTINEL = ZERO_ADDRESS;
export const ETHEREUM_EBRAKE = ZERO_ADDRESS;
export const ETHEREUM_SENTINEL_ORACLE = ZERO_ADDRESS;
export const ETHEREUM_UNISWAP_ORACLE = ZERO_ADDRESS;
export const ETHEREUM_MULTISIG_PAUSER = ZERO_ADDRESS;
export const ETHEREUM_KEEPER = ZERO_ADDRESS;

// PLACEHOLDER — first monitored token + its Uniswap V3 pool. Leave as ZERO_ADDRESS to skip token wiring.
export const ETHEREUM_MONITORED_TOKEN = ZERO_ADDRESS;
export const ETHEREUM_MONITORED_POOL = ZERO_ADDRESS;
export const ETHEREUM_DEVIATION_PERCENT = 20;

export const ETHEREUM_DST_CHAIN_ID = LzChainId.ethereum;

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
  multisigPauser: ETHEREUM_MULTISIG_PAUSER,
  keeper: ETHEREUM_KEEPER,
  monitoredToken: ETHEREUM_MONITORED_TOKEN,
  monitoredPool: ETHEREUM_MONITORED_POOL,
  deviationPercent: ETHEREUM_DEVIATION_PERCENT,
} as const;
