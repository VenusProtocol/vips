// Critical-timelock action plan — remote chains (7), reconciled against live ACM state.
// Every remote action is a revoke from Critical (the Guardian keeps whatever it already holds); there are
// no swaps/grants on remotes.
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";

export const ZERO = "0x0000000000000000000000000000000000000000";

export type RemoteChain =
  | "ethereum"
  | "arbitrumone"
  | "basemainnet"
  | "zksyncmainnet"
  | "opmainnet"
  | "unichainmainnet"
  | "opbnbmainnet";

export const REMOTE_CHAINS: RemoteChain[] = [
  "ethereum",
  "arbitrumone",
  "basemainnet",
  "zksyncmainnet",
  "opmainnet",
  "unichainmainnet",
  "opbnbmainnet",
];

export const LZ_CHAIN_ID: Record<RemoteChain, LzChainId> = {
  ethereum: LzChainId.ethereum,
  arbitrumone: LzChainId.arbitrumone,
  basemainnet: LzChainId.basemainnet,
  zksyncmainnet: LzChainId.zksyncmainnet,
  opmainnet: LzChainId.opmainnet,
  unichainmainnet: LzChainId.unichainmainnet,
  opbnbmainnet: LzChainId.opbnbmainnet,
};

// ACM for op / unichain / opBNB is not in networkAddresses — hardcoded (verified on-chain).
export const REMOTE_ACM: Record<RemoteChain, string> = {
  ethereum: NETWORK_ADDRESSES.ethereum.ACCESS_CONTROL_MANAGER,
  arbitrumone: NETWORK_ADDRESSES.arbitrumone.ACCESS_CONTROL_MANAGER,
  basemainnet: NETWORK_ADDRESSES.basemainnet.ACCESS_CONTROL_MANAGER,
  zksyncmainnet: NETWORK_ADDRESSES.zksyncmainnet.ACCESS_CONTROL_MANAGER,
  opmainnet: "0xD71b1F33f6B0259683f11174EE4Ddc2bb9cE4eD6",
  unichainmainnet: "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0",
  opbnbmainnet: "0xA60Deae5344F1152426cA440fb6552eA0e3005D6",
};

// Per-chain contract addresses that networkAddresses does not key.
const XVS_BRIDGE_ADMIN: Record<RemoteChain, string> = {
  ethereum: "0x9C6C95632A8FB3A74f2fB4B7FfC50B003c992b96",
  arbitrumone: "0xf5d81C6F7DAA3F97A6265C8441f92eFda22Ad784",
  basemainnet: "0x6303FEcee7161bF959d65df4Afb9e1ba5701f78e",
  zksyncmainnet: "0x2471043F05Cc41A6051dd6714DC967C7BfC8F902",
  opmainnet: "0x3c307DF1Bf3198a2417d9CA86806B307D147Ddf7",
  unichainmainnet: "0x2EAaa880f97C9B63d37b39b0b316022d93d43604",
  opbnbmainnet: "0x52fcE05aDbf6103d71ed2BA8Be7A317282731831",
};

const OMNICHAIN_EXECUTOR_OWNER: Record<RemoteChain, string> = {
  ethereum: "0x87Ed3Fd3a25d157637b955991fb1B41B566916Ba",
  arbitrumone: "0xf72C1Aa0A1227B4bCcB28E1B1015F0616E2db7fD",
  basemainnet: "0x8BA591f72a90fb379b9a82087b190d51b226F0a9",
  zksyncmainnet: "0xdfaed3E5d9707629Ed5c225b4fB980c064286771",
  opmainnet: "0xe6d9Eb3A07a1dc4496fc71417D7A7b9d5666BaA3",
  unichainmainnet: "0x6E78a0d96257F8F2615d72F3ee48cb6fb2c970bd",
  opbnbmainnet: "0xf7e4c81Cf4A03d52472a4d00c3d9Ef35aF127E45",
};

// SentinelOracle is not published in the @venusprotocol deployment packages — hardcoded proxies,
// verified on-chain.
const SENTINEL_ORACLE: Partial<Record<RemoteChain, string>> = {
  ethereum: "0x444C53E194B40c272fAd683210e2cB1c16Ab132e",
  arbitrumone: "0x3563CAbc541a0432C66A64942ffB4070a9726226",
  basemainnet: "0xCdD6D79Fd313C21967CED04C1b8bE70BDc27574D",
};

const addressesOf = (chain: RemoteChain) => NETWORK_ADDRESSES[chain] as Record<string, string>;

// Resolve a contract key to its address on a chain. On Arbitrum/OP the "CHAINLINK_ORACLE" key is the
// SequencerChainlinkOracle adapter.
export const remoteAddr = (chain: RemoteChain, c: string): string => {
  switch (c) {
    case "WILDCARD":
      return ZERO;
    case "ResilientOracle":
      return addressesOf(chain).RESILIENT_ORACLE;
    case "ChainlinkOracle":
      return addressesOf(chain).CHAINLINK_ORACLE;
    case "RedStoneOracle":
      return addressesOf(chain).REDSTONE_ORACLE;
    case "SequencerChainlinkOracle":
      return addressesOf(chain).CHAINLINK_ORACLE;
    case "SentinelOracle":
      return SENTINEL_ORACLE[chain]!;
    case "XVSBridgeAdmin":
      return XVS_BRIDGE_ADMIN[chain];
    case "OmnichainExecutorOwner":
      return OMNICHAIN_EXECUTOR_OWNER[chain];
    default:
      throw new Error(`unknown remote contract key ${c}`);
  }
};

const ALL_REMOTES = REMOTE_CHAINS;

// Every row is a revoke from Critical. contract = contract key (resolved per-chain); chains = where it
// applies; guardian = Guardian currently holds it (must still hold post-VIP).
export const REMOTE_ROWS: { signature: string; contract: string; chains: RemoteChain[]; guardian: boolean }[] = [
  // ── Common to all 7 remotes ──
  { signature: "setTokenConfig(TokenConfig)", contract: "ResilientOracle", chains: ALL_REMOTES, guardian: true },
  {
    signature: "setCollateralFactor(address,uint256,uint256)",
    contract: "WILDCARD",
    chains: ALL_REMOTES,
    guardian: true,
  },
  { signature: "addTimelocks(address[])", contract: "OmnichainExecutorOwner", chains: ALL_REMOTES, guardian: true },
  {
    signature: "setMaxDailyReceiveLimit(uint256)",
    contract: "OmnichainExecutorOwner",
    chains: ALL_REMOTES,
    guardian: true,
  },
  { signature: "setWhitelist(address,bool)", contract: "XVSBridgeAdmin", chains: ALL_REMOTES, guardian: false },

  // ── Chain-specific ──
  {
    signature: "setDirectPrice(address,uint256)",
    contract: "ChainlinkOracle",
    chains: ["ethereum", "basemainnet", "zksyncmainnet"],
    guardian: true,
  },
  {
    signature: "setTokenConfig(TokenConfig)",
    contract: "ChainlinkOracle",
    chains: ["ethereum", "basemainnet", "zksyncmainnet"],
    guardian: true,
  },
  {
    signature: "setDirectPrice(address,uint256)",
    contract: "RedStoneOracle",
    chains: ["ethereum", "arbitrumone", "basemainnet", "zksyncmainnet", "opmainnet", "unichainmainnet"],
    guardian: true,
  },
  {
    signature: "setTokenConfig(TokenConfig)",
    contract: "RedStoneOracle",
    chains: ["ethereum", "arbitrumone", "basemainnet", "zksyncmainnet", "opmainnet", "unichainmainnet"],
    guardian: true,
  },
  {
    signature: "setDirectPrice(address,uint256)",
    contract: "SequencerChainlinkOracle",
    chains: ["arbitrumone", "opmainnet"],
    guardian: true,
  },
  {
    signature: "setTokenConfig(TokenConfig)",
    contract: "SequencerChainlinkOracle",
    chains: ["arbitrumone", "opmainnet"],
    guardian: true,
  },
  {
    signature: "setDirectPrice(address,uint256)",
    contract: "SentinelOracle",
    chains: ["ethereum", "arbitrumone", "basemainnet"],
    guardian: true,
  },
  {
    signature: "setTokenOracleConfig(address,address)",
    contract: "SentinelOracle",
    chains: ["ethereum", "arbitrumone", "basemainnet"],
    guardian: true,
  },
];

// Rows applicable to one chain, with resolved target address.
export const remoteRowsFor = (chain: RemoteChain) =>
  REMOTE_ROWS.filter(r => r.chains.includes(chain)).map(r => ({
    signature: r.signature,
    target: remoteAddr(chain, r.contract),
    guardian: r.guardian,
  }));

export const EXPECTED_ROLE_EVENTS: Record<"bscmainnet" | RemoteChain, { granted: number; revoked: number }> = {
  bscmainnet: { granted: 6, revoked: 55 },
  ethereum: { granted: 2, revoked: 50 },
  arbitrumone: { granted: 2, revoked: 22 },
  basemainnet: { granted: 2, revoked: 17 },
  zksyncmainnet: { granted: 2, revoked: 19 },
  opmainnet: { granted: 2, revoked: 15 },
  unichainmainnet: { granted: 2, revoked: 15 },
  opbnbmainnet: { granted: 2, revoked: 11 },
};
