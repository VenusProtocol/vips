import { ethers } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command } from "src/types";

import { BNB_ACM, BNB_CRITICAL, BNB_GUARDIANS, REMOTE_ACM } from "../data/addresses";
import {
  CLEANUP_LEGACY_WILDCARD_REVOKES,
  REDUNDANT_REVOKES,
  RedundantChain,
  STALE_ROWS,
  syncCashGrants,
  syncCashRevokes,
} from "../data/cleanup";
import {
  BNB_ACTIONS,
  BNB_ACTION_LEGACY_WILDCARD_REVOKES,
  REMOTE_CHAINS,
  RemoteChain,
  remoteRowsFor,
} from "../data/criticalChanges";

export type Chain = "bscmainnet" | RemoteChain;
export const CHAINS: Chain[] = ["bscmainnet", ...REMOTE_CHAINS];

export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

// ACMCommandsAggregator per chain
export const AGGREGATOR: Record<Chain, string> = {
  bscmainnet: "0x8b443Ea6726E56DF4C4F62f80F0556bB9B2a7c64",
  ethereum: "0xb78772bed6995551b64e54Cdb8e09800d86C73ee",
  arbitrumone: "0x74AFeA28456a683b8fF907699Ff77138edef00f3",
  basemainnet: "0xB2770DBD5146f7ee0766Dc9E3931433bb697Aa06",
  zksyncmainnet: "0x88B1452e512c8fcf83889DdCfe54dF37D561Db82",
  opmainnet: "0xbbEBaF646e7a3E4064a899e68565B1b439eFdf70",
  unichainmainnet: "0x904D11b00bdB2740d16176cc00DE139d0d626115",
  opbnbmainnet: "0x6dB5e303289fea2E83F7d442470210045592AD93",
};

export const GRANT_INDEX: Record<Chain, number> = {
  bscmainnet: 4,
  ethereum: 3,
  arbitrumone: 2,
  basemainnet: 2,
  zksyncmainnet: 2,
  opmainnet: 2,
  unichainmainnet: 4,
  opbnbmainnet: 2,
};
export const REVOKE_INDEX: Record<Chain, number> = {
  bscmainnet: 0,
  ethereum: 2,
  arbitrumone: 2,
  basemainnet: 1,
  zksyncmainnet: 1,
  opmainnet: 1,
  unichainmainnet: 2,
  opbnbmainnet: 2,
};

export const acmOf = (chain: Chain): string => (chain === "bscmainnet" ? BNB_ACM : REMOTE_ACM[chain]);
export const criticalOf = (chain: Chain): string =>
  chain === "bscmainnet" ? BNB_CRITICAL : NETWORK_ADDRESSES[chain].CRITICAL_TIMELOCK;

// A single ACM permission the aggregator grants or revokes. Field names match the on-chain
// ACMCommandsAggregator.Permission struct (contractAddress, functionSig, account).
export interface Permission {
  contractAddress: string;
  functionSig: string;
  account: string;
}

// ====================================================================================================
// Critical maintenance — the VIP's core intent: reduce CriticalTimelock privileges.
// ====================================================================================================
// Grants: on BNB a swap/grant action hands the function to a Guardian. Remotes only revoke, so no grants.
export const criticalGrants = (chain: Chain): Permission[] => {
  if (chain !== "bscmainnet") return [];
  return BNB_ACTIONS.filter(r => r.action === "swap" || r.action === "grant").map(r => ({
    contractAddress: r.target,
    functionSig: r.signature,
    account: BNB_GUARDIANS[r.grantTo ?? "guardian1"],
  }));
};

// Revokes: on BNB every revoke/swap action drops the function from Critical; on remotes every remote row
// from that chain's Critical.
export const criticalRevokes = (chain: Chain): Permission[] => {
  if (chain === "bscmainnet")
    return BNB_ACTIONS.filter(r => r.action === "revoke" || r.action === "swap").map(r => ({
      contractAddress: r.target,
      functionSig: r.signature,
      account: BNB_CRITICAL,
    }));
  const critical = criticalOf(chain);
  return remoteRowsFor(chain).map(r => ({
    contractAddress: r.target,
    functionSig: r.signature,
    account: critical,
  }));
};

// ====================================================================================================
// Cleanup — ACM maintenance, independent of the Critical privilege reduction. Three sub-categories:
// syncCash() normalization (remotes), stale/dangling grants (BNB), and redundant wildcard-shadowed grants.
// ====================================================================================================
// Grants: the single wildcard syncCash() grant to NormalTimelock (remotes only; BNB has no cleanup grant).
export const cleanupGrants = (chain: Chain): Permission[] => (chain === "bscmainnet" ? [] : syncCashGrants(chain));

// Redundant target-specific grants — shadowed by an identical wildcard grant held by the same account, so
// revoking them is behavior-preserving.
const redundantRevokes = (chain: Chain): Permission[] =>
  REDUNDANT_REVOKES[chain as RedundantChain].map(r => ({
    contractAddress: r.contract,
    functionSig: r.signature,
    account: r.account,
  }));

// Revokes: the stale/dangling grants (BNB) or the per-market syncCash() grants (remotes), then the redundant
// grants (all chains). De-duplication against the Critical revokes happens in buildRevokePermissions.
export const cleanupRevokes = (chain: Chain): Permission[] => {
  const rows: Permission[] = [];
  if (chain === "bscmainnet") {
    for (const s of STALE_ROWS)
      for (const who of s.revokeFrom) rows.push({ contractAddress: s.target, functionSig: s.signature, account: who });
  } else {
    rows.push(...syncCashRevokes(chain));
  }
  rows.push(...redundantRevokes(chain));
  return rows;
};

// ====================================================================================================
// Combined — every grant / every revoke for a chain. These are what seed the ACM aggregator.
// ====================================================================================================
// Key identifying a unique ACM revoke (contract + function + grantee).
const revokeKey = (p: Permission) => `${p.contractAddress.toLowerCase()}|${p.functionSig}|${p.account.toLowerCase()}`;

// Every grant: Critical maintenance + cleanup. The two never overlap, so no de-duplication needed.
export const buildGrantPermissions = (chain: Chain): Permission[] => [
  ...criticalGrants(chain),
  ...cleanupGrants(chain),
];

// Every revoke: Critical maintenance + cleanup, then de-duplicated. A redundant revoke can coincide with a
// Critical revoke (e.g. Unitroller.setCollateralFactor from Critical on BNB), and the aggregator must not
// revoke the same (contract, function, account) twice.
export const buildRevokePermissions = (chain: Chain): Permission[] => {
  const seen = new Set<string>();
  return [...criticalRevokes(chain), ...cleanupRevokes(chain)].filter(p => {
    const k = revokeKey(p);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// BNB legacy-ACM wildcard quirk. The AccessControlManager on bscmainnet derives a wildcard ("any contract")
// role from the 32-byte DEFAULT_ADMIN_ROLE constant, not the 20-byte address(0). revokeCallPermission hashes
// the 20-byte zero, so it targets a different role and can never clear a wildcard grant — and the
// ACMCommandsAggregator only calls give/revokeCallPermission. These grants are cleared with a direct
// ACM.revokeRole(legacyRole, account), which the NormalTimelock (proposal executor and ACM DEFAULT_ADMIN) can call.
export const legacyWildcardRole = (signature: string): string =>
  ethers.utils.solidityKeccak256(["bytes32", "string"], [ethers.constants.HashZero, signature]);

// Wildcard grants on the bscmainnet legacy ACM the plan revokes but the aggregator cannot reach: the
// setCollateralFactor revoke from Critical (action plan) and the retired risk steward cap powers (cleanup).
export const BNB_LEGACY_WILDCARD_REVOKES: { signature: string; account: string }[] = [
  ...BNB_ACTION_LEGACY_WILDCARD_REVOKES,
  ...CLEANUP_LEGACY_WILDCARD_REVOKES,
];

// Direct ACM.revokeRole calls for the legacy wildcard grants, executed by the NormalTimelock.
export const legacyWildcardCommands = (): Command[] =>
  BNB_LEGACY_WILDCARD_REVOKES.map(r => ({
    target: BNB_ACM,
    signature: "revokeRole(bytes32,address)",
    params: [legacyWildcardRole(r.signature), r.account],
  }));
