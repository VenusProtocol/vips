import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import * as reaudit from "./utils/data.bsctestnet-addendum";

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

// ════════════════════════════════════════════════════════════════════════════
// Block 1 — Institutional Fixed Rate Vault controller re-upgrade (VPD-1488)
// ════════════════════════════════════════════════════════════════════════════
// Re-point the InstitutionalVaultController proxy to a new implementation that can clear a previously set
// institution-name override (setInstitutionNameOverride now accepts an empty string; the VIP-665 impl reverted,
// so a mistaken override could never be undone). Controller-only change; ACM permissions and vault impl untouched.

export const INSTITUTIONAL_VAULT_CONTROLLER = "0xf77dED2A00F94e33C392126238360D4642c16Ba2";
export const VAULT_PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";
export const OLD_CONTROLLER_IMPLEMENTATION = "0xEb8Ca841cBe1BC4832A10b15c7dAB1081eDaD371";
export const NEW_CONTROLLER_IMPLEMENTATION = "0xC36dFaCc7a125859C106F29b9F2d874CCF29A55A";

const meta: ProposalMeta = {
  version: "v2",
  title:
    "VIP-665 Addendum [BNB Chain Testnet] Institutional Fixed Rate Vault controller re-upgrade + Certik VPD-1241 reaudit re-apply",
  description: `#### Summary

Merged addendum on BNB Chain Testnet. Neither underlying addendum has executed, so both are bundled here as two
independent blocks:

**1. Institutional Fixed Rate Vault controller re-upgrade (VPD-1488)**

Re-upgrades the \`InstitutionalVaultController\` proxy to a new implementation that can clear a previously set
institution-name override: \`setInstitutionNameOverride\` now accepts an empty string to remove an override and fall
back to the vault's on-chain name (previously it reverted, so a mistaken override could not be undone). This is a
controller-only change with no signature changes — it only re-points the proxy via the \`ProxyAdmin\`; the ACM
permissions and vault implementation from VIP-665 are unchanged.

| Contract | Proxy | Old implementation | New implementation |
|---|---|---|---|
| InstitutionalVaultController | ${INSTITUTIONAL_VAULT_CONTROLLER} | ${OLD_CONTROLLER_IMPLEMENTATION} | ${NEW_CONTROLLER_IMPLEMENTATION} |

- **ProxyAdmin**: ${VAULT_PROXY_ADMIN}

**2. Certik VPD-1241 reaudit — re-apply post-execution fixes**

Re-applies the audit fixes that landed after the original VIP-999 testnet proposal was executed (VLC-12/18/51),
using freshly recompiled bytecode, and upgrades the E-brake Executor:

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

export const vip665Addendum = () => {
  return makeProposal(
    [
      // ══════════════════════════════════════════════════════════════════════
      // Block 1 — Institutional Fixed Rate Vault controller re-upgrade
      // ══════════════════════════════════════════════════════════════════════

      // Re-point the InstitutionalVaultController proxy at the new implementation.
      {
        target: VAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [INSTITUTIONAL_VAULT_CONTROLLER, NEW_CONTROLLER_IMPLEMENTATION],
      },

      // ══════════════════════════════════════════════════════════════════════
      // Block 2 — Certik VPD-1241 reaudit: re-apply post-execution fixes
      // ══════════════════════════════════════════════════════════════════════

      // 2a. Core Pool Comptroller — re-recut (all REPLACE; selectors already exist).
      {
        target: reaudit.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [reaudit.FACETS.map(f => [f.newFacet, FacetCutAction.Replace, f.selectors])],
      },
      { target: reaudit.UNITROLLER, signature: "_setPendingImplementation(address)", params: [reaudit.NEW_DIAMOND] },
      { target: reaudit.NEW_DIAMOND, signature: "_become(address)", params: [reaudit.UNITROLLER] },
      { target: reaudit.UNITROLLER, signature: "_setComptrollerLens(address)", params: [reaudit.NEW_COMPTROLLER_LENS] },

      // 2b. Core Pool markets — VBep20Delegate.
      ...[...Object.values(reaudit.VTOKENS_TO_UPGRADE), ...Object.values(reaudit.BSTOCK_MARKETS)].map(vToken => ({
        target: vToken,
        signature: "_setImplementation(address,bool,bytes)",
        params: [reaudit.NEW_VTOKEN_DELEGATE, false, "0x"],
      })),

      // 2c. Re-sync internalCash on the BStock markets.
      ...Object.values(reaudit.BSTOCK_MARKETS).map(vToken => ({
        target: vToken,
        signature: "sweepTokenAndSync(uint256)",
        params: [0],
      })),

      // 2d. Executor (E-brake V2).
      {
        target: reaudit.PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [reaudit.EXECUTOR, reaudit.NEW_EXECUTOR_IMPL],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip665Addendum;
