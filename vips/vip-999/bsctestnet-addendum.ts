import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BSTOCK_MARKETS,
  EXECUTOR,
  FACETS,
  NEW_COMPTROLLER_LENS,
  NEW_DIAMOND,
  NEW_EXECUTOR_IMPL,
  NEW_VTOKEN_DELEGATE,
  PROXY_ADMIN,
  UNITROLLER,
  VTOKENS_TO_UPGRADE,
} from "./utils/data.bsctestnet-addendum";

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

const meta: ProposalMeta = {
  version: "v2",
  title: "VIP-999 addendum [BNB Chain testnet] Certik VPD-1241 reaudit: re-apply post-execution fixes",
  description: `Addendum to the already-executed VIP-999 testnet proposal. It re-applies the audit fixes that
landed after that proposal was executed (VLC-12/18/51), using freshly recompiled bytecode, and upgrades the
E-brake Executor:

- Core Pool Comptroller — re-recut: the Diamond implementation and all five facets (Market, Policy, Reward,
  Setter, FlashLoan) are replaced with the latest recompiled bytecode, preserving the existing
  function-to-facet mapping. Every selector (including the two RewardFacet overloads added by the original
  proposal) is REPLACE-d onto the recompiled facets; nothing new is added.
- ComptrollerLens — updated to the recompiled lens (skips zero-balance entered markets in the solvency
  hypothetical).
- VBep20Delegate — the standard-delegate Core Pool markets (including the BStock markets vTSLAB, vNVDAB and
  vSPCXB) are repointed to the recompiled delegate. The BStock markets were added after the original proposal
  with internalCash left unsynced, so they are additionally re-synced via sweepTokenAndSync(0).
- Executor (E-brake V2) — implementation-only upgrade: cap-exceeding emergency halts now fail closed if the
  cap read reverts.

Liquidator and LeverageStrategiesManager are unchanged by the post-execution fixes and are not re-upgraded.
The new seizeVenus(address[],address,address[]) ACM permission was already granted by the original proposal.`,
  forDescription: "I agree that Venus Protocol should proceed with this proposal",
  againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
  abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
};

export const vip999Addendum = () => {
  return makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────────
      // 1. Core Pool Comptroller — re-recut (all REPLACE; selectors already exist)
      // ──────────────────────────────────────────────────────────────────────────

      {
        target: UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [FACETS.map(f => [f.newFacet, FacetCutAction.Replace, f.selectors])],
      },
      { target: UNITROLLER, signature: "_setPendingImplementation(address)", params: [NEW_DIAMOND] },
      { target: NEW_DIAMOND, signature: "_become(address)", params: [UNITROLLER] },

      { target: UNITROLLER, signature: "_setComptrollerLens(address)", params: [NEW_COMPTROLLER_LENS] },

      // ──────────────────────────────────────────────────────────────────────────
      // 2. Core Pool markets — VBep20Delegate
      // ──────────────────────────────────────────────────────────────────────────

      ...[...Object.values(VTOKENS_TO_UPGRADE), ...Object.values(BSTOCK_MARKETS)].map(vToken => ({
        target: vToken,
        signature: "_setImplementation(address,bool,bytes)",
        params: [NEW_VTOKEN_DELEGATE, false, "0x"],
      })),

      // Re-sync internalCash on the BStock markets
      ...Object.values(BSTOCK_MARKETS).map(vToken => ({
        target: vToken,
        signature: "sweepTokenAndSync(uint256)",
        params: [0],
      })),

      // ──────────────────────────────────────────────────────────────────────────
      // 3. Executor (E-brake V2)
      // ──────────────────────────────────────────────────────────────────────────

      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [EXECUTOR, NEW_EXECUTOR_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip999Addendum;
