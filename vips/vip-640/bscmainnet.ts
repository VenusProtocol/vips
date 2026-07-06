import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import * as reaudit from "./utils/data.bscmainnet";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, CRITICAL_GUARDIAN, ACCESS_CONTROL_MANAGER } =
  NETWORK_ADDRESSES.bscmainnet;

// ════════════════════════════════════════════════════════════════════════════
// Block 1 — Institutional Fixed Rate Vault implementation upgrade (VPD-1488)
// ════════════════════════════════════════════════════════════════════════════

export const INSTITUTIONAL_VAULT_CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85";
export const PROXY_ADMIN = "0x6beb6d2695b67feb73ad4f172e8e2975497187e4";

export const OLD_CONTROLLER_IMPLEMENTATION = "0x9e1ECb2671AfabE9eaAA2e74Cb2318a9b6A2Eb5d";
export const OLD_VAULT_IMPLEMENTATION = "0x10d63B1203E5A0719AbbE927C8BFc87135b2F129";

export const NEW_CONTROLLER_IMPLEMENTATION = "0xBD9df626c642591cef3612586CC5e45E9767360f";
export const NEW_VAULT_IMPLEMENTATION = "0xC25b2B657D24380eDd1a1Cff5296385541e85204";

export const AUTHORIZED_CALLERS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, CRITICAL_GUARDIAN];

// createVault gained a third string param, so its old permission must be re-granted and revoked.
export const CREATE_VAULT_OLD = "createVault(VaultConfig,InstitutionalConfig,RiskConfig,string,string)";
export const CREATE_VAULT_NEW = "createVault(VaultConfig,InstitutionalConfig,RiskConfig,string,string,string)";
export const SET_INSTITUTION_NAME = "setInstitutionName(address,string)";
export const SET_INSTITUTION_NAME_OVERRIDE = "setInstitutionNameOverride(address,string)";

export const NEW_PERMISSIONS = [CREATE_VAULT_NEW, SET_INSTITUTION_NAME, SET_INSTITUTION_NAME_OVERRIDE];

// The one existing mainnet vault predates the institutionName field, so this VIP sets its display-name override.
export const LEGACY_VAULT = "0x7D80A10bEdD13638888e7A946B82878E21fbB820";
export const LEGACY_VAULT_INSTITUTION_NAME = "Matrixdock";

// The 20 ACM give/revoke calls are pre-seeded off-chain into the AuxiliaryCommandsAggregator
// (see ./utils/seed-acm-batch.bscmainnet.ts) and run in one batch to stay under the BSC gas cap.
export const COMMANDS_AGGREGATOR = "0x528A428748dfE73DFcc844176B401475D1831057";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_BATCH_INDEX = 0;

export interface AcmCommand {
  target: string;
  signature: string;
  params: any[];
}

// The exact ACM calls the aggregator batch performs. Shared by the seeding script and the simulation so
// the seeded batch is guaranteed identical to what the VIP relies on.
export const buildAcmBatch = (): AcmCommand[] => [
  // vault: grant the new createVault + setInstitutionName + setInstitutionNameOverride permissions
  ...NEW_PERMISSIONS.flatMap(fn =>
    AUTHORIZED_CALLERS.map(caller => ({
      target: ACCESS_CONTROL_MANAGER,
      signature: "giveCallPermission(address,string,address)",
      params: [INSTITUTIONAL_VAULT_CONTROLLER, fn, caller],
    })),
  ),
  // vault: revoke the now-dead old createVault permission
  ...AUTHORIZED_CALLERS.map(caller => ({
    target: ACCESS_CONTROL_MANAGER,
    signature: "revokeCallPermission(address,string,address)",
    params: [INSTITUTIONAL_VAULT_CONTROLLER, CREATE_VAULT_OLD, caller],
  })),
  // reaudit: grant the new market-filtered seizeVenus permission. Its grantees are the same set as
  // AUTHORIZED_CALLERS (Normal / Fast-track / Critical timelocks + Critical Guardian), so reuse that array.
  ...AUTHORIZED_CALLERS.map(caller => ({
    target: ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [reaudit.UNITROLLER, reaudit.SEIZE_VENUS_FILTERED_SIGNATURE, caller],
  })),
];

export const vip640 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-640 [BNB Chain] Upgrade Institutional Fixed Rate Vault implementations + Certik VPD-1241 reaudit (Core Pool, Liquidator, Leverage Manager)",
    description: `#### Summary

If passed, this VIP bundles two independent BNB Chain implementation upgrades: the Institutional Fixed Rate Vault upgrade (VPD-1488), and the Certik "Core Feature Reaudit" fixes (VPD-1241) covering the Core Pool Comptroller, Liquidator, Leverage Manager, and Executor. No risk parameters are changed.

#### Description

Both are maintenance-grade implementation upgrades — no existing positions are modified, and no user action is required.

**1. Institutional Fixed Rate Vault implementation upgrade (VPD-1488)**

The vault controller and its vault clone-source are upgraded so each vault carries a renamable institution name for display. Existing vaults are immutable clones and are not modified; the change applies to vaults created from now on, plus a one-time display-name override (${LEGACY_VAULT_INSTITUTION_NAME}) for the single existing vault.

- **InstitutionalVaultController** — proxy ${INSTITUTIONAL_VAULT_CONTROLLER}: old implementation ${OLD_CONTROLLER_IMPLEMENTATION}, new implementation ${NEW_CONTROLLER_IMPLEMENTATION}
- **InstitutionalLoanVault (clone source)** — no proxy (cloned per vault): old implementation ${OLD_VAULT_IMPLEMENTATION}, new implementation ${NEW_VAULT_IMPLEMENTATION}

**2. Certik "Core Feature Reaudit" fixes (VPD-1241)**

Recompiled, re-audited implementations are deployed across several core contracts, preserving existing behavior:

- **Core Pool Comptroller (Diamond)** — Unitroller ${reaudit.UNITROLLER}: new implementation ${reaudit.NEW_DIAMOND}
- **ComptrollerLens** — Core Pool Comptroller: new implementation ${reaudit.NEW_COMPTROLLER_LENS}
- **Liquidator** — ${reaudit.LIQUIDATOR}: new implementation ${reaudit.NEW_LIQUIDATOR_IMPL}
- **Core Pool markets (VBep20Delegate)** — selected vTokens (excl. native-BNB vBNB): new implementation ${reaudit.NEW_VTOKEN_DELEGATE}
- **LeverageStrategiesManager** — ${reaudit.LEVERAGE_STRATEGIES_MANAGER}: new implementation ${reaudit.NEW_LEVERAGE_IMPL}
- **Executor (Emergency Brake V2)** — ${reaudit.EXECUTOR}: new implementation ${reaudit.NEW_EXECUTOR_IMPL}

One low-risk oracle input-validation fix from the same reaudit is intentionally excluded; new oracle deployments can adopt the updated contract.

#### Actions

On-chain, this VIP upgrades each contract listed above to its new implementation (recutting the Core Pool Comptroller diamond and repointing the selected Core Pool markets), and re-grants the ACM permissions required by the vault and the new reaudit functions. To keep the proposal under BNB Chain's per-transaction gas limit, those ACM changes are pre-seeded into the AuxiliaryCommandsAggregator (${COMMANDS_AGGREGATOR}) and executed in a single batch, with the aggregator holding the ACM admin role only transiently. The complete, exact call list is in [VenusProtocol/vips#729](https://github.com/VenusProtocol/vips/pull/729).

#### Voting options

- **For** — Execute the proposal
- **Against** — Do not execute the proposal
- **Abstain** — Indifferent to execution`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ══════════════════════════════════════════════════════════════════════
      // Block 1 — ACM permissions (batched via AuxiliaryCommandsAggregator)
      // ══════════════════════════════════════════════════════════════════════
      // Runs FIRST so permissions are in place before Block 2's setInstitutionNameOverride and the new functions.
      // Grant the aggregator the ACM admin role, run the pre-seeded batch, then revoke the role (transient).
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, COMMANDS_AGGREGATOR],
      },
      { target: COMMANDS_AGGREGATOR, signature: "executeBatch(uint256)", params: [ACM_BATCH_INDEX] },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, COMMANDS_AGGREGATOR],
      },

      // ══════════════════════════════════════════════════════════════════════
      // Block 2 — Institutional Fixed Rate Vault implementation upgrade
      // ══════════════════════════════════════════════════════════════════════

      // 2a. Upgrade the InstitutionalVaultController proxy to the new implementation.
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [INSTITUTIONAL_VAULT_CONTROLLER, NEW_CONTROLLER_IMPLEMENTATION],
      },
      // 2b. Point the controller at the new vault implementation used to clone future vaults.
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "setVaultImplementation(address)",
        params: [NEW_VAULT_IMPLEMENTATION],
      },
      // 2c. Override the legacy vault's display name so getAggregatedVaultStates() doesn't revert post-upgrade.
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "setInstitutionNameOverride(address,string)",
        params: [LEGACY_VAULT, LEGACY_VAULT_INSTITUTION_NAME],
      },

      // ══════════════════════════════════════════════════════════════════════
      // Block 3 — Certik VPD-1241 reaudit: Core Pool, Liquidator, Leverage Manager
      // ══════════════════════════════════════════════════════════════════════

      // 3a. Core Pool Comptroller — recut the diamond and repoint the ComptrollerLens.
      {
        target: reaudit.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [
          [
            ...reaudit.FACETS.map(f => [f.newFacet, reaudit.FacetCutAction.Replace, f.selectors]),
            ...reaudit.FACETS.filter(f => f.newSelectors.length > 0).map(f => [
              f.newFacet,
              reaudit.FacetCutAction.Add,
              f.newSelectors,
            ]),
          ],
        ],
      },
      { target: reaudit.UNITROLLER, signature: "_setPendingImplementation(address)", params: [reaudit.NEW_DIAMOND] },
      { target: reaudit.NEW_DIAMOND, signature: "_become(address)", params: [reaudit.UNITROLLER] },
      { target: reaudit.UNITROLLER, signature: "_setComptrollerLens(address)", params: [reaudit.NEW_COMPTROLLER_LENS] },

      // 3b. Liquidator.
      {
        target: reaudit.LIQUIDATOR_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [reaudit.LIQUIDATOR, reaudit.NEW_LIQUIDATOR_IMPL],
      },

      // 3c. Core Pool markets — VBep20Delegate.
      ...Object.values(reaudit.VTOKENS_TO_UPGRADE).map(vToken => ({
        target: vToken,
        signature: "_setImplementation(address,bool,bytes)",
        params: [reaudit.NEW_VTOKEN_DELEGATE, false, "0x"],
      })),

      // 3d. LeverageStrategiesManager.
      {
        target: reaudit.LEVERAGE_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [reaudit.LEVERAGE_STRATEGIES_MANAGER, reaudit.NEW_LEVERAGE_IMPL],
      },

      // 3e. Executor (E-brake V2).
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

export default vip640;
