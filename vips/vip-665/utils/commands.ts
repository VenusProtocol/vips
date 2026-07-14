import { NETWORK_ADDRESSES } from "src/networkAddresses";

import { BNB_ACM, BNB_CRITICAL, BNB_GUARDIANS, BNB_ROWS } from "../data/bnb";
import { REMOTE_ACM, REMOTE_CHAINS, RemoteChain, remoteRowsFor } from "../data/remote";
import { STALE_ROWS } from "../data/staleness";
import { syncCashGrants, syncCashRevokes } from "../data/syncCash";

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

// Permissions the aggregator grants on a chain. On BNB: swap → move a function to a Guardian, grant → add a
// Guardian alongside Critical. On remotes: the single wildcard syncCash() grant to NormalTimelock (the
// syncCash hygiene cleanup); remotes have no Guardian swaps/grants.
export const grantPermissions = (chain: Chain): Permission[] => {
  if (chain !== "bscmainnet") return syncCashGrants(chain);
  return BNB_ROWS.filter(r => r.action === "swap" || r.action === "grant").map(r => ({
    contractAddress: r.target,
    functionSig: r.signature,
    account: BNB_GUARDIANS[r.grantTo ?? "guardian1"],
  }));
};

// Permissions the aggregator revokes on a chain: revoke/swap/stale rows from Critical on BNB (plus the
// staleness / legacy cleanup); on remotes every remote row from that chain's Critical, plus the per-market
// syncCash() grants from NormalTimelock (replaced by the wildcard grant above).
export const revokePermissions = (chain: Chain): Permission[] => {
  if (chain === "bscmainnet") {
    const revokes: Permission[] = BNB_ROWS.filter(
      r => r.action === "revoke" || r.action === "swap" || r.action === "stale",
    ).map(r => ({ contractAddress: r.target, functionSig: r.signature, account: BNB_CRITICAL }));
    // Staleness / legacy cleanup: revoke each dangling grant from every current holder.
    for (const s of STALE_ROWS)
      for (const who of s.revokeFrom)
        revokes.push({ contractAddress: s.target, functionSig: s.signature, account: who });
    return revokes;
  }
  const critical = criticalOf(chain);
  const criticalRevokes = remoteRowsFor(chain).map(r => ({
    contractAddress: r.target,
    functionSig: r.signature,
    account: critical,
  }));
  return [...criticalRevokes, ...syncCashRevokes(chain)];
};
