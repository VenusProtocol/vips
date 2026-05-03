import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";

const { basemainnet } = NETWORK_ADDRESSES;

// Already-deployed governance + protocol addresses on Base mainnet
export const BASEMAINNET_ACM = basemainnet.ACCESS_CONTROL_MANAGER;
export const BASEMAINNET_GUARDIAN = basemainnet.GUARDIAN;
export const BASEMAINNET_NORMAL_TIMELOCK = basemainnet.NORMAL_TIMELOCK;
export const BASEMAINNET_FAST_TRACK_TIMELOCK = basemainnet.FAST_TRACK_TIMELOCK;
export const BASEMAINNET_CRITICAL_TIMELOCK = basemainnet.CRITICAL_TIMELOCK;
export const BASEMAINNET_CORE_COMPTROLLER = basemainnet.CORE_COMPTROLLER;

// Deployed via venus-periphery PR #65 (feat/VPD-1134)
export const BASEMAINNET_DEVIATION_SENTINEL = "0x12D09d5b13A673269cdB624D17A42f45a5233076";
export const BASEMAINNET_EBRAKE = "0x062C68Af7B9Fb059DCB7FA4B6b92E633350fb7c2";
export const BASEMAINNET_SENTINEL_ORACLE = "0xCdD6D79Fd313C21967CED04C1b8bE70BDc27574D";
export const BASEMAINNET_UNISWAP_ORACLE = "0xc3b5169a7d5f6341403c74187Db3C4Fe6d447762";
// Deployed via venus-periphery PR #66 — prices Aerodrome Slipstream (CL) pools whose
// slot0() 6-tuple is incompatible with the UniswapOracle V3 ABI.
export const BASEMAINNET_AERODROME_ORACLE = "0x5DE0B322A74088fD64CDD01042BE2fBc47FE82EC";
export const BASEMAINNET_MULTISIG_PAUSER = "0xCCa5a587eBDBe80f23c8610F2e53B03158e62948"; // Venus team multisig
export const BASEMAINNET_KEEPER = "0x57fa23f591203f61cef84a7bc892df69ca95c86e";

export const BASEMAINNET_DST_CHAIN_ID = LzChainId.basemainnet;

// Eligible Core Pool markets — unified 10% threshold. WETH and USDC route through the
// most liquid Uniswap V3 Base pool; cbBTC and wstETH route through the AerodromeSlipstreamOracle
// because their only liquid pools live on Aerodrome's concentrated-liquidity DEX.
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
    oracleType: "aerodrome" as const,
  },
  {
    symbol: "wstETH",
    token: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
    pool: "0x861a2922be165a5bd41b1e482b49216b465e1b5f", // wstETH/WETH Aerodrome Slipstream
    deviationPercent: 10,
    oracleType: "aerodrome" as const,
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
  aerodromeOracle: BASEMAINNET_AERODROME_ORACLE,
  multisigPauser: BASEMAINNET_MULTISIG_PAUSER,
  keeper: BASEMAINNET_KEEPER,
  monitoredMarkets: BASEMAINNET_MONITORED_MARKETS,
} as const;
