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

export const BASEMAINNET_DST_CHAIN_ID = LzChainId.basemainnet;

// Eligible Core Pool markets — Aerodrome Slipstream + Uniswap V3 Base sources,
// unified 10% threshold. Aerodrome Slipstream is a Uniswap V3 fork; pools are
// V3-compatible and readable through UniswapOracle.sol's IUniswapV3Pool interface.
export const BASEMAINNET_MONITORED_MARKETS = [
  {
    symbol: "WETH",
    token: "0x4200000000000000000000000000000000000006",
    pool: "0x6c561b446416e1a00e8e93e221854d6ea4171372", // WETH/USDC Uniswap V3 Base
    deviationPercent: 10,
  },
  {
    symbol: "USDC",
    token: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    pool: "0x6c561b446416e1a00e8e93e221854d6ea4171372", // USDC/WETH Uniswap V3 Base
    deviationPercent: 10,
  },
  {
    symbol: "cbBTC",
    token: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf",
    pool: "0x4e962bb3889bf030368f56810a9c96b83cb3e778", // cbBTC/USDC Aerodrome Slipstream
    deviationPercent: 10,
  },
  {
    symbol: "wstETH",
    token: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
    pool: "0x861a2922be165a5bd41b1e482b49216b465e1b5f", // wstETH/WETH Aerodrome Slipstream
    deviationPercent: 10,
  },
];

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
  monitoredMarkets: BASEMAINNET_MONITORED_MARKETS,
} as const;
