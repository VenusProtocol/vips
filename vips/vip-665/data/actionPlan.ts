// VIP-665 — reduce CriticalTimelock privileges across BNB Chain and the 7 remote mainnets.
// BNB rows carry the current holder flags and the final action; remote rows are all Critical revokes.
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";

import {
  BNB_CRITICAL,
  BNB_CONTRACTS as CONTRACTS,
  OMNICHAIN_EXECUTOR_OWNER,
  SENTINEL_ORACLE,
  XVS_BRIDGE_ADMIN,
  ZERO,
} from "./addresses";
import { BNB_NO_CHANGE_ROWS } from "./noChangeRows";

// ===================================================================================================
// BNB Chain
// ===================================================================================================
export type Action = "none" | "revoke" | "swap" | "grant";
// signature = ACM-registered function signature; target = contract it is scoped to;
// critical/guardian1/guardian2/guardian3 = current holders; action = final action;
// grantTo = destination guardian for swap/grant actions.
export interface BnbRow {
  signature: string;
  target: string;
  critical: boolean;
  guardian1: boolean;
  guardian2: boolean;
  guardian3: boolean;
  action: Action;
  grantTo?: "guardian1" | "guardian2" | "guardian3";
}

// Rows carrying an actual change (revoke / swap / grant) — this is the review surface. The untouched
// "No change" inventory lives in noChangeRows.ts and is read only by the simulation's assertions.
export const BNB_ACTION_ROWS: BnbRow[] = [
  {
    signature: "setCollateralFactor(address,uint256,uint256)",
    target: CONTRACTS.Unitroller,
    critical: true,
    guardian1: true,
    guardian2: false,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setCollateralFactor(uint96,address,uint256,uint256)",
    target: CONTRACTS.Unitroller,
    critical: true,
    guardian1: true,
    guardian2: false,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setWhiteListFlashLoanAccount(address,bool)",
    target: CONTRACTS.Unitroller,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "_setMarketBorrowCaps(address[],uint256[])",
    target: CONTRACTS.Unitroller,
    critical: true,
    guardian1: true,
    guardian2: false,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "_setMarketSupplyCaps(address[],uint256[])",
    target: CONTRACTS.Unitroller,
    critical: true,
    guardian1: true,
    guardian2: false,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setIsBorrowAllowed(uint96,address,bool)",
    target: CONTRACTS.Unitroller,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "_setForcedLiquidation(address,bool)",
    target: CONTRACTS.Unitroller,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: false,
    action: "swap",
    grantTo: "guardian1",
  },
  {
    signature: "_setForcedLiquidationForUser(address,address,bool)",
    target: CONTRACTS.Unitroller,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: false,
    action: "swap",
    grantTo: "guardian1",
  },
  {
    signature: "resume()",
    target: CONTRACTS.XVSVaultProxy,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setDirectPrice(address,uint256)",
    target: CONTRACTS.ChainlinkOracle,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: true,
    action: "revoke",
  },
  {
    signature: "setTokenConfig(TokenConfig)",
    target: CONTRACTS.ChainlinkOracle,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: true,
    action: "revoke",
  },
  {
    signature: "setUnderlyingPrice(address,uint256)",
    target: CONTRACTS.ChainlinkOracle,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: true,
    action: "revoke",
  },
  {
    signature: "setThresholds(address,uint256,uint256)",
    target: CONTRACTS.DeviationBoundedOracle,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: false,
    action: "grant",
    grantTo: "guardian1",
  },
  {
    signature: "setTokenConfig(TokenConfig)",
    target: CONTRACTS.PythOracle,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: true,
    action: "revoke",
  },
  {
    signature: "setDirectPrice(address,uint256)",
    target: CONTRACTS.RedStoneOracle,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: true,
    action: "revoke",
  },
  {
    signature: "setTokenConfig(TokenConfig)",
    target: CONTRACTS.RedStoneOracle,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: true,
    action: "revoke",
  },
  {
    signature: "setTokenConfig(TokenConfig)",
    target: CONTRACTS.ResilientOracle,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: true,
    action: "revoke",
  },
  {
    signature: "setDirectPrice(address,uint256)",
    target: CONTRACTS.USDTChainlinkOracle,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: true,
    action: "revoke",
  },
  {
    signature: "setTokenConfig(TokenConfig)",
    target: CONTRACTS.USDTChainlinkOracle,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: true,
    action: "revoke",
  },
  {
    signature: "addOrUpdateDistributionConfigs(DistributionConfig[])",
    target: CONTRACTS.ProtocolShareReserve,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "executePositionAccountCall(address,address[],bytes[])",
    target: CONTRACTS.RelativePositionManager,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setDirectPrice(address,uint256)",
    target: CONTRACTS.SentinelOracle,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setTokenOracleConfig(address,address)",
    target: CONTRACTS.SentinelOracle,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setWhitelist(address,bool)",
    target: CONTRACTS.XVSBridgeAdmin,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: false,
    action: "swap",
    grantTo: "guardian1",
  },
  {
    signature: "setMaxDailyLimit(uint16,uint256)",
    target: CONTRACTS.XVSBridgeAdmin,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setMaxDailyReceiveLimit(uint16,uint256)",
    target: CONTRACTS.XVSBridgeAdmin,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
    target: CONTRACTS.XVSBridgeAdmin,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setMaxSingleTransactionLimit(uint16,uint256)",
    target: CONTRACTS.XVSBridgeAdmin,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "unpause()",
    target: CONTRACTS.XVSBridgeAdmin,
    critical: true,
    guardian1: false,
    guardian2: true,
    guardian3: false,
    action: "revoke",
  },
  {
    signature: "setLiquidationThreshold(address,uint256)",
    target: CONTRACTS.InstitutionalVaultControllerProxy,
    critical: true,
    guardian1: false,
    guardian2: false,
    guardian3: false,
    action: "swap",
    grantTo: "guardian1",
  },
  {
    signature: "sweep(address,address)",
    target: CONTRACTS.InstitutionalVaultControllerProxy,
    critical: true,
    guardian1: true,
    guardian2: false,
    guardian3: false,
    action: "revoke",
  },
];

// Full row set: actions + untouched inventory. commands.ts builders filter by action; the simulation
// groups by action into its category buckets.
export const BNB_ROWS: BnbRow[] = [...BNB_ACTION_ROWS, ...BNB_NO_CHANGE_ROWS];

// setCollateralFactor on the isolated-pools wildcard target is revoked from the CriticalTimelock via a
// direct ACM.revokeRole on the legacy BNB ACM (the aggregator cannot clear wildcard grants there — see
// legacyWildcardRole in utils/commands.ts).
export const BNB_ACTION_LEGACY_WILDCARD_REVOKES: { signature: string; account: string }[] = [
  { signature: "setCollateralFactor(address,uint256,uint256)", account: BNB_CRITICAL },
];

// ===================================================================================================
// Remote chains
// ===================================================================================================
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
