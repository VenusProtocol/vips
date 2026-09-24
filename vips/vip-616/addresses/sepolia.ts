import { NETWORK_ADDRESSES, ZERO_ADDRESS } from "src/networkAddresses";
import { LzChainId } from "src/types";

const { sepolia } = NETWORK_ADDRESSES;

// Already-deployed governance + protocol addresses on Sepolia
export const SEPOLIA_GUARDIAN_OWNER = "0xFEA1c651A47FE29dB9b1bf3cC1f224d8D9CFF68C"; // deployer EOA
export const SEPOLIA_ACM = sepolia.ACCESS_CONTROL_MANAGER;
export const SEPOLIA_GUARDIAN = sepolia.GUARDIAN;
export const SEPOLIA_NORMAL_TIMELOCK = sepolia.NORMAL_TIMELOCK;
export const SEPOLIA_FAST_TRACK_TIMELOCK = sepolia.FAST_TRACK_TIMELOCK;
export const SEPOLIA_CRITICAL_TIMELOCK = sepolia.CRITICAL_TIMELOCK;
export const SEPOLIA_CORE_COMPTROLLER = sepolia.CORE_COMPTROLLER;

// Deployed via venus-periphery feat/VPD-1134
export const SEPOLIA_DEVIATION_SENTINEL = "0x3a22AA95998a6c5f57e86E24fEA1503452Bdfa39";
export const SEPOLIA_EBRAKE = "0x44784FBa07b5199a7a21C8A8E4a50c45137227BC";
export const SEPOLIA_SENTINEL_ORACLE = "0xb5A87b6738C1cB2f1a1Acae8c49DbE32f8034CA5";
// UniswapOracle not deployed on testnet — deviation testing uses SentinelOracle.setDirectPrice()
// instead of live DEX feeds. Ownership acceptance is skipped for ZERO_ADDRESS targets in the
// Sepolia VIP builder.
export const SEPOLIA_UNISWAP_ORACLE = ZERO_ADDRESS;

// On Sepolia testnet the guardian EOA acts as both keeper and multisig pauser so that
// all emergency actions can be triggered manually after the VIP executes once.
export const SEPOLIA_MULTISIG_PAUSER = sepolia.GUARDIAN;
export const SEPOLIA_KEEPER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706"; // same keeper as BSC testnet

export const SEPOLIA_DST_CHAIN_ID = LzChainId.sepolia;

// Underlying token addresses for the two monitored markets.
// Pools are ZERO_ADDRESS — testnet deviation is simulated via SentinelOracle.setDirectPrice().
// The VIP-667 builder skips setPoolConfig / setTokenOracleConfig for markets with a zero pool.
const WBTC = "0x92A2928f5634BEa89A195e7BeCF0f0FEEDAB885b"; // MockWBTC on Sepolia

export const SEPOLIA_MONITORED_MARKETS = [
  {
    symbol: "WETH",
    token: sepolia.WETH,
    pool: ZERO_ADDRESS,
    deviationPercent: 10,
  },
  {
    symbol: "WBTC",
    token: WBTC,
    pool: ZERO_ADDRESS,
    deviationPercent: 10,
  },
];

export const SEPOLIA_CONFIG = {
  name: "Sepolia",
  dstChainId: SEPOLIA_DST_CHAIN_ID,
  acm: SEPOLIA_ACM,
  guardian: SEPOLIA_GUARDIAN,
  normalTimelock: SEPOLIA_NORMAL_TIMELOCK,
  fastTrackTimelock: SEPOLIA_FAST_TRACK_TIMELOCK,
  criticalTimelock: SEPOLIA_CRITICAL_TIMELOCK,
  comptroller: SEPOLIA_CORE_COMPTROLLER,
  deviationSentinel: SEPOLIA_DEVIATION_SENTINEL,
  eBrake: SEPOLIA_EBRAKE,
  sentinelOracle: SEPOLIA_SENTINEL_ORACLE,
  uniswapOracle: SEPOLIA_UNISWAP_ORACLE,
  multisigPauser: SEPOLIA_MULTISIG_PAUSER,
  keeper: SEPOLIA_KEEPER,
  monitoredMarkets: SEPOLIA_MONITORED_MARKETS,
} as const;
