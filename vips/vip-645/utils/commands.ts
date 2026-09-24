import { ethers } from "ethers";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { Command } from "src/types";

import { ACM, BNB_CRITICAL, Chain } from "../data/addresses";
import {
  CLEANUP_LEGACY_WILDCARD_REVOKES,
  REDUNDANT_REVOKES,
  STALE_ROWS,
  syncCashGrants,
  syncCashRevokes,
} from "../data/cleanup";
import { BNB_CRITICAL_WILDCARD_SIGS, CRITICAL_REVOKES } from "../data/criticalRevokes";

export type { Chain } from "../data/addresses";

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
// The aggregator batch index/indices each chain's revokes are seeded at. The VIP calls
// executeRevokePermissions once per index. Every chain has a single index except BNB Chain, whose 254
// revokes exceed the Osaka per-tx gas cap (16,777,216) as one batch (~92k gas/revoke) and so are seeded
// and executed as two halves — see bscRevokeBatches().
export const REVOKE_INDICES: Record<Chain, number[]> = {
  bscmainnet: [0, 1],
  ethereum: [2],
  arbitrumone: [2],
  basemainnet: [1],
  zksyncmainnet: [1],
  opmainnet: [1],
  unichainmainnet: [2],
  opbnbmainnet: [2],
};

export const acmOf = (chain: Chain): string => ACM[chain];
const criticalOf = (chain: Chain): string => NETWORK_ADDRESSES[chain].CRITICAL_TIMELOCK;

// A single ACM permission the aggregator grants or revokes. Field names match the on-chain
// ACMCommandsAggregator.Permission struct (contractAddress, functionSig, account).
export interface Permission {
  contractAddress: string;
  functionSig: string;
  account: string;
}

// Every permission the CriticalTimelock holds on a chain. On BNB the aggregator clears the specific-contract
// grants; its legacy wildcard grants are cleared separately via legacyWildcardCommands.
const criticalRevokes = (chain: Chain): Permission[] => {
  const critical = criticalOf(chain);
  return CRITICAL_REVOKES[chain].map(r => ({ contractAddress: r.target, functionSig: r.signature, account: critical }));
};

// Cleanup grants: the single wildcard syncCash() grant to NormalTimelock (remotes only; BNB has none).
const cleanupGrants = (chain: Chain): Permission[] => (chain === "bscmainnet" ? [] : syncCashGrants(chain));

const redundantRevokes = (chain: Chain): Permission[] =>
  REDUNDANT_REVOKES[chain].map(r => ({ contractAddress: r.contract, functionSig: r.signature, account: r.account }));

// Cleanup revokes: stale/dangling grants (BNB) or per-market syncCash() grants (remotes), plus the redundant
// wildcard-shadowed grants (all chains).
const cleanupRevokes = (chain: Chain): Permission[] => {
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

// The grants / revokes that seed the ACM aggregator for a chain.
export const buildGrantPermissions = (chain: Chain): Permission[] => cleanupGrants(chain);

// De-duplicated: a redundant revoke can coincide with a Critical revoke (e.g. Unitroller.setCollateralFactor
// from Critical on BNB), and the aggregator must not revoke the same (contract, function, account) twice.
export const buildRevokePermissions = (chain: Chain): Permission[] => {
  const seen = new Set<string>();
  return [...criticalRevokes(chain), ...cleanupRevokes(chain)].filter(p => {
    const key = `${p.contractAddress.toLowerCase()}|${p.functionSig}|${p.account.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const bscRevokeBatches = (): Permission[][] => {
  const all = buildRevokePermissions("bscmainnet");
  const mid = Math.ceil(all.length / 2);
  return [all.slice(0, mid), all.slice(mid)];
};

// BNB legacy-ACM wildcard quirk: the bscmainnet ACM keys its "any contract" wildcard role off the 32-byte
// DEFAULT_ADMIN_ROLE, so the aggregator's revokeCallPermission (which hashes the 20-byte address(0)) can't
// reach it. These grants are cleared with a direct ACM.revokeRole, callable by the NormalTimelock.
export const legacyWildcardRole = (signature: string): string =>
  ethers.utils.solidityKeccak256(["bytes32", "string"], [ethers.constants.HashZero, signature]);

// Legacy wildcard grants the aggregator can't reach: the CriticalTimelock's wildcard grants plus the
// deprecated-grantee cleanup wildcards (retired risk steward caps + SetCheckpoint interest-rate-model).
const BNB_LEGACY_WILDCARD_REVOKES: { signature: string; account: string }[] = [
  ...BNB_CRITICAL_WILDCARD_SIGS.map(signature => ({ signature, account: BNB_CRITICAL })),
  ...CLEANUP_LEGACY_WILDCARD_REVOKES,
];

// Direct ACM.revokeRole calls for the legacy wildcard grants, executed by the NormalTimelock.
export const legacyWildcardCommands = (): Command[] =>
  BNB_LEGACY_WILDCARD_REVOKES.map(r => ({
    target: ACM.bscmainnet,
    signature: "revokeRole(bytes32,address)",
    params: [legacyWildcardRole(r.signature), r.account],
  }));
