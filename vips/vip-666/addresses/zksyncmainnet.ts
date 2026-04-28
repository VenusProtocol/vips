import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { LzChainId } from "src/types";

const { zksyncmainnet } = NETWORK_ADDRESSES;

// Already-deployed governance + protocol addresses on zkSync Era mainnet
export const ZKSYNCMAINNET_ACM = zksyncmainnet.ACCESS_CONTROL_MANAGER;
export const ZKSYNCMAINNET_GUARDIAN = zksyncmainnet.GUARDIAN;
export const ZKSYNCMAINNET_NORMAL_TIMELOCK = zksyncmainnet.NORMAL_TIMELOCK;
export const ZKSYNCMAINNET_FAST_TRACK_TIMELOCK = zksyncmainnet.FAST_TRACK_TIMELOCK;
export const ZKSYNCMAINNET_CRITICAL_TIMELOCK = zksyncmainnet.CRITICAL_TIMELOCK;
export const ZKSYNCMAINNET_CORE_COMPTROLLER = zksyncmainnet.CORE_COMPTROLLER;

// PLACEHOLDERS — to be filled once the EBrake/DeviationSentinel stack is deployed on zkSync Era
export const ZKSYNCMAINNET_DEVIATION_SENTINEL = ZERO_ADDRESS;
export const ZKSYNCMAINNET_EBRAKE = ZERO_ADDRESS;
export const ZKSYNCMAINNET_SENTINEL_ORACLE = ZERO_ADDRESS;
export const ZKSYNCMAINNET_UNISWAP_ORACLE = ZERO_ADDRESS;
export const ZKSYNCMAINNET_MULTISIG_PAUSER = ZERO_ADDRESS;
export const ZKSYNCMAINNET_KEEPER = ZERO_ADDRESS;

export const ZKSYNCMAINNET_DST_CHAIN_ID = LzChainId.zksyncmainnet;

// Eligible Core Pool markets — SyncSwap V3 (primary). Only WETH passes the
// liquidity threshold; the rest of the spec's markets sit in "Thin Pool — Needs
// Discussion" and are excluded from this VIP.
export const ZKSYNCMAINNET_MONITORED_MARKETS = [
  {
    symbol: "WETH",
    token: "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91",
    pool: "0xe955c98e8411ee4c7332ebe48df7f0ca12711dc2", // WETH/USDC SyncSwap V3
    deviationPercent: 10,
  },
];

export const ZKSYNCMAINNET_CONFIG = {
  name: "zkSync Era",
  dstChainId: ZKSYNCMAINNET_DST_CHAIN_ID,
  acm: ZKSYNCMAINNET_ACM,
  guardian: ZKSYNCMAINNET_GUARDIAN,
  normalTimelock: ZKSYNCMAINNET_NORMAL_TIMELOCK,
  fastTrackTimelock: ZKSYNCMAINNET_FAST_TRACK_TIMELOCK,
  criticalTimelock: ZKSYNCMAINNET_CRITICAL_TIMELOCK,
  comptroller: ZKSYNCMAINNET_CORE_COMPTROLLER,
  deviationSentinel: ZKSYNCMAINNET_DEVIATION_SENTINEL,
  eBrake: ZKSYNCMAINNET_EBRAKE,
  sentinelOracle: ZKSYNCMAINNET_SENTINEL_ORACLE,
  uniswapOracle: ZKSYNCMAINNET_UNISWAP_ORACLE,
  multisigPauser: ZKSYNCMAINNET_MULTISIG_PAUSER,
  keeper: ZKSYNCMAINNET_KEEPER,
  monitoredMarkets: ZKSYNCMAINNET_MONITORED_MARKETS,
} as const;
