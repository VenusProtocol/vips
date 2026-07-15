// VIP-665 — CriticalTimelock privilege changes across BNB Chain and the 7 remote mainnets.
// This file is the review surface: only permissions the VIP actually changes. Untouched ("No change")
// permissions are intentionally not listed — the VIP does not touch them, so there is nothing to assert.
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

// ===================================================================================================
// BNB Chain
// ===================================================================================================
// revoke = remove from Critical · swap = grant to the Guardian then revoke from Critical · grant = add to
// the Guardian while Critical keeps it. grantTo = destination Guardian for swap/grant.
export type Action = "revoke" | "swap" | "grant";

export interface BnbAction {
  target: string;
  signature: string;
  action: Action;
  grantTo?: "guardian1" | "guardian2" | "guardian3";
}

export const BNB_ACTIONS: BnbAction[] = [
  { target: CONTRACTS.Unitroller, signature: "setCollateralFactor(address,uint256,uint256)", action: "revoke" },
  { target: CONTRACTS.Unitroller, signature: "setCollateralFactor(uint96,address,uint256,uint256)", action: "revoke" },
  { target: CONTRACTS.Unitroller, signature: "setWhiteListFlashLoanAccount(address,bool)", action: "revoke" },
  { target: CONTRACTS.Unitroller, signature: "_setMarketBorrowCaps(address[],uint256[])", action: "revoke" },
  { target: CONTRACTS.Unitroller, signature: "_setMarketSupplyCaps(address[],uint256[])", action: "revoke" },
  { target: CONTRACTS.Unitroller, signature: "setIsBorrowAllowed(uint96,address,bool)", action: "revoke" },
  {
    target: CONTRACTS.Unitroller,
    signature: "_setForcedLiquidation(address,bool)",
    action: "swap",
    grantTo: "guardian1",
  },
  {
    target: CONTRACTS.Unitroller,
    signature: "_setForcedLiquidationForUser(address,address,bool)",
    action: "swap",
    grantTo: "guardian1",
  },
  { target: CONTRACTS.XVSVaultProxy, signature: "resume()", action: "revoke" },
  { target: CONTRACTS.ChainlinkOracle, signature: "setDirectPrice(address,uint256)", action: "revoke" },
  { target: CONTRACTS.ChainlinkOracle, signature: "setTokenConfig(TokenConfig)", action: "revoke" },
  { target: CONTRACTS.ChainlinkOracle, signature: "setUnderlyingPrice(address,uint256)", action: "revoke" },
  {
    target: CONTRACTS.DeviationBoundedOracle,
    signature: "setThresholds(address,uint256,uint256)",
    action: "grant",
    grantTo: "guardian1",
  },
  { target: CONTRACTS.PythOracle, signature: "setTokenConfig(TokenConfig)", action: "revoke" },
  { target: CONTRACTS.RedStoneOracle, signature: "setDirectPrice(address,uint256)", action: "revoke" },
  { target: CONTRACTS.RedStoneOracle, signature: "setTokenConfig(TokenConfig)", action: "revoke" },
  { target: CONTRACTS.ResilientOracle, signature: "setTokenConfig(TokenConfig)", action: "revoke" },
  { target: CONTRACTS.USDTChainlinkOracle, signature: "setDirectPrice(address,uint256)", action: "revoke" },
  { target: CONTRACTS.USDTChainlinkOracle, signature: "setTokenConfig(TokenConfig)", action: "revoke" },
  {
    target: CONTRACTS.ProtocolShareReserve,
    signature: "addOrUpdateDistributionConfigs(DistributionConfig[])",
    action: "revoke",
  },
  {
    target: CONTRACTS.RelativePositionManager,
    signature: "executePositionAccountCall(address,address[],bytes[])",
    action: "revoke",
  },
  { target: CONTRACTS.SentinelOracle, signature: "setDirectPrice(address,uint256)", action: "revoke" },
  { target: CONTRACTS.SentinelOracle, signature: "setTokenOracleConfig(address,address)", action: "revoke" },
  { target: CONTRACTS.XVSBridgeAdmin, signature: "setWhitelist(address,bool)", action: "swap", grantTo: "guardian1" },
  { target: CONTRACTS.XVSBridgeAdmin, signature: "setMaxDailyLimit(uint16,uint256)", action: "revoke" },
  { target: CONTRACTS.XVSBridgeAdmin, signature: "setMaxDailyReceiveLimit(uint16,uint256)", action: "revoke" },
  {
    target: CONTRACTS.XVSBridgeAdmin,
    signature: "setMaxSingleReceiveTransactionLimit(uint16,uint256)",
    action: "revoke",
  },
  { target: CONTRACTS.XVSBridgeAdmin, signature: "setMaxSingleTransactionLimit(uint16,uint256)", action: "revoke" },
  { target: CONTRACTS.XVSBridgeAdmin, signature: "unpause()", action: "revoke" },
  {
    target: CONTRACTS.InstitutionalVaultControllerProxy,
    signature: "setLiquidationThreshold(address,uint256)",
    action: "swap",
    grantTo: "guardian1",
  },
  { target: CONTRACTS.InstitutionalVaultControllerProxy, signature: "sweep(address,address)", action: "revoke" },
];

// setCollateralFactor on the isolated-pools wildcard target is revoked from Critical via a direct
// ACM.revokeRole on the legacy BNB ACM (the aggregator cannot clear wildcard grants there — see
// legacyWildcardRole in utils/commands.ts).
export const BNB_ACTION_LEGACY_WILDCARD_REVOKES: { signature: string; account: string }[] = [
  { signature: "setCollateralFactor(address,uint256,uint256)", account: BNB_CRITICAL },
];

// ===================================================================================================
// Remote chains — all Critical revokes
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

// One revoke-from-Critical row. contract = contract key resolved per-chain by remoteAddr.
export interface RemoteRow {
  signature: string;
  contract: string;
}

// Revoke rows written out explicitly per chain. Each block is ordered `common` (the 5 rows every remote
// shares — repeated in every block by design, for readability) then `chain-specific`. Editing here is the
// review surface; remoteRowsFor() just resolves each contract key to its address.
export const REMOTE_ROWS_BY_CHAIN: Record<RemoteChain, RemoteRow[]> = {
  ethereum: [
    // ── common to all remotes ──
    { signature: "setTokenConfig(TokenConfig)", contract: "ResilientOracle" },
    { signature: "setCollateralFactor(address,uint256,uint256)", contract: "WILDCARD" },
    { signature: "addTimelocks(address[])", contract: "OmnichainExecutorOwner" },
    { signature: "setMaxDailyReceiveLimit(uint256)", contract: "OmnichainExecutorOwner" },
    { signature: "setWhitelist(address,bool)", contract: "XVSBridgeAdmin" },
    // ── chain-specific ──
    { signature: "setDirectPrice(address,uint256)", contract: "ChainlinkOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "ChainlinkOracle" },
    { signature: "setDirectPrice(address,uint256)", contract: "RedStoneOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "RedStoneOracle" },
    { signature: "setDirectPrice(address,uint256)", contract: "SentinelOracle" },
    { signature: "setTokenOracleConfig(address,address)", contract: "SentinelOracle" },
  ],
  arbitrumone: [
    // ── common to all remotes ──
    { signature: "setTokenConfig(TokenConfig)", contract: "ResilientOracle" },
    { signature: "setCollateralFactor(address,uint256,uint256)", contract: "WILDCARD" },
    { signature: "addTimelocks(address[])", contract: "OmnichainExecutorOwner" },
    { signature: "setMaxDailyReceiveLimit(uint256)", contract: "OmnichainExecutorOwner" },
    { signature: "setWhitelist(address,bool)", contract: "XVSBridgeAdmin" },
    // ── chain-specific ──
    { signature: "setDirectPrice(address,uint256)", contract: "RedStoneOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "RedStoneOracle" },
    { signature: "setDirectPrice(address,uint256)", contract: "SequencerChainlinkOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "SequencerChainlinkOracle" },
    { signature: "setDirectPrice(address,uint256)", contract: "SentinelOracle" },
    { signature: "setTokenOracleConfig(address,address)", contract: "SentinelOracle" },
  ],
  basemainnet: [
    // ── common to all remotes ──
    { signature: "setTokenConfig(TokenConfig)", contract: "ResilientOracle" },
    { signature: "setCollateralFactor(address,uint256,uint256)", contract: "WILDCARD" },
    { signature: "addTimelocks(address[])", contract: "OmnichainExecutorOwner" },
    { signature: "setMaxDailyReceiveLimit(uint256)", contract: "OmnichainExecutorOwner" },
    { signature: "setWhitelist(address,bool)", contract: "XVSBridgeAdmin" },
    // ── chain-specific ──
    { signature: "setDirectPrice(address,uint256)", contract: "ChainlinkOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "ChainlinkOracle" },
    { signature: "setDirectPrice(address,uint256)", contract: "RedStoneOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "RedStoneOracle" },
    { signature: "setDirectPrice(address,uint256)", contract: "SentinelOracle" },
    { signature: "setTokenOracleConfig(address,address)", contract: "SentinelOracle" },
  ],
  zksyncmainnet: [
    // ── common to all remotes ──
    { signature: "setTokenConfig(TokenConfig)", contract: "ResilientOracle" },
    { signature: "setCollateralFactor(address,uint256,uint256)", contract: "WILDCARD" },
    { signature: "addTimelocks(address[])", contract: "OmnichainExecutorOwner" },
    { signature: "setMaxDailyReceiveLimit(uint256)", contract: "OmnichainExecutorOwner" },
    { signature: "setWhitelist(address,bool)", contract: "XVSBridgeAdmin" },
    // ── chain-specific ──
    { signature: "setDirectPrice(address,uint256)", contract: "ChainlinkOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "ChainlinkOracle" },
    { signature: "setDirectPrice(address,uint256)", contract: "RedStoneOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "RedStoneOracle" },
  ],
  opmainnet: [
    // ── common to all remotes ──
    { signature: "setTokenConfig(TokenConfig)", contract: "ResilientOracle" },
    { signature: "setCollateralFactor(address,uint256,uint256)", contract: "WILDCARD" },
    { signature: "addTimelocks(address[])", contract: "OmnichainExecutorOwner" },
    { signature: "setMaxDailyReceiveLimit(uint256)", contract: "OmnichainExecutorOwner" },
    { signature: "setWhitelist(address,bool)", contract: "XVSBridgeAdmin" },
    // ── chain-specific ──
    { signature: "setDirectPrice(address,uint256)", contract: "RedStoneOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "RedStoneOracle" },
    { signature: "setDirectPrice(address,uint256)", contract: "SequencerChainlinkOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "SequencerChainlinkOracle" },
  ],
  unichainmainnet: [
    // ── common to all remotes ──
    { signature: "setTokenConfig(TokenConfig)", contract: "ResilientOracle" },
    { signature: "setCollateralFactor(address,uint256,uint256)", contract: "WILDCARD" },
    { signature: "addTimelocks(address[])", contract: "OmnichainExecutorOwner" },
    { signature: "setMaxDailyReceiveLimit(uint256)", contract: "OmnichainExecutorOwner" },
    { signature: "setWhitelist(address,bool)", contract: "XVSBridgeAdmin" },
    // ── chain-specific ──
    { signature: "setDirectPrice(address,uint256)", contract: "RedStoneOracle" },
    { signature: "setTokenConfig(TokenConfig)", contract: "RedStoneOracle" },
  ],
  opbnbmainnet: [
    // ── common to all remotes (no chain-specific rows) ──
    { signature: "setTokenConfig(TokenConfig)", contract: "ResilientOracle" },
    { signature: "setCollateralFactor(address,uint256,uint256)", contract: "WILDCARD" },
    { signature: "addTimelocks(address[])", contract: "OmnichainExecutorOwner" },
    { signature: "setMaxDailyReceiveLimit(uint256)", contract: "OmnichainExecutorOwner" },
    { signature: "setWhitelist(address,bool)", contract: "XVSBridgeAdmin" },
  ],
};

// Rows applicable to one chain, with resolved target address.
export const remoteRowsFor = (chain: RemoteChain) =>
  REMOTE_ROWS_BY_CHAIN[chain].map(r => ({
    signature: r.signature,
    target: remoteAddr(chain, r.contract),
  }));
