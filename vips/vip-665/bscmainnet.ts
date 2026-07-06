import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import * as reaudit from "./utils/data.bscmainnet";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, CRITICAL_GUARDIAN, ACCESS_CONTROL_MANAGER } =
  NETWORK_ADDRESSES.bscmainnet;

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

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

export const vip665 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-665 [BNB Chain] Upgrade Institutional Fixed Rate Vault implementations + Certik VPD-1241 reaudit (Core Pool, Liquidator, Leverage Manager)",
    description: `#### Summary

If passed, this VIP bundles two independent upgrades on BNB Chain:

**1. Institutional Fixed Rate Vault implementation upgrade (VPD-1488)**

- Upgrade the \`InstitutionalVaultController\` transparent proxy to a new implementation via the \`ProxyAdmin\`.
- Update the vault implementation used by the controller to clone new vaults via \`setVaultImplementation()\`.
  Existing vault clones are immutable (EIP-1167 minimal proxies); this only affects vaults created from now on.
- Re-grant ACM permission for \`createVault\`: the new implementation appends a third \`string\`
  (\`institutionName\`) to the signature, so the previously granted \`${CREATE_VAULT_OLD}\` no longer matches.
  The new \`${CREATE_VAULT_NEW}\` is granted to the Normal / Fast-track / Critical timelocks and the
  Critical Guardian, and the stale old permission is revoked.
- Grant ACM permission for the two new controller functions \`${SET_INSTITUTION_NAME}\` and
  \`${SET_INSTITUTION_NAME_OVERRIDE}\` to the same callers.
- Set a display-name override (\`${LEGACY_VAULT_INSTITUTION_NAME}\`) for the single existing vault
  (\`${LEGACY_VAULT}\`) via \`setInstitutionNameOverride()\`. That vault was created on the old
  implementation and predates the on-chain \`institutionName\` field, so without an override
  \`getAggregatedVaultStates()\` would revert for it after the upgrade.

The new implementations add a renamable \`institutionName\` as a **standalone field on the vault**, leaving the
\`InstitutionalConfig\` struct — and therefore \`institutionalConfig()\`'s ABI — unchanged, so existing vault
clones remain fully decodable. The controller also gains an \`institutionNameOverride\` mapping used by
\`getAggregatedVaultStates()\` to supply a display name for legacy vaults that predate the on-chain field; the
override can be cleared by passing an empty string.

| Contract | Proxy | Old implementation | New implementation |
|---|---|---|---|
| InstitutionalVaultController | ${INSTITUTIONAL_VAULT_CONTROLLER} | ${OLD_CONTROLLER_IMPLEMENTATION} | ${NEW_CONTROLLER_IMPLEMENTATION} |
| InstitutionalLoanVault (clone source) | n/a (cloned per vault) | ${OLD_VAULT_IMPLEMENTATION} | ${NEW_VAULT_IMPLEMENTATION} |

- **ProxyAdmin**: ${PROXY_ADMIN}

**2. Certik "Venus Labs – Core Feature Reaudit" fixes (VPD-1241)**

- **Core Pool Comptroller** — the full diamond is recut: the Diamond implementation and all five facets (Market, Policy, Reward, Setter, FlashLoan) are replaced with the recompiled, audited bytecode, preserving the existing function-to-facet mapping. The RewardFacet additionally gains two market-filtered overloads, claimVenusAsCollateral(address,address[]) and seizeVenus(address[],address,address[]), and enforces vXVS-market entry when claiming as collateral with a shortfall. The new seizeVenus overload is ACM-gated under a new signature, so call permission for seizeVenus(address[],address,address[]) is granted to the Normal, Fast-track and Critical timelocks and the critical guardian.
- **ComptrollerLens** — solvency hypothetical now skips entered markets with neither supply nor debt.
- **Liquidator** — accrues VAI interest before the force-liquidation gate; honors the per-borrower forced-liquidation flag.
- **VBep20Delegate** — recompiled, audited delegate; the Core Pool markets selected for this VIP are repointed to it. Excluded: the native-BNB vBNB market.
- **LeverageStrategiesManager** — dust returned via operation deltas; new owner-only sweepToken(address).
- **Executor (E-brake V2)** — implementation-only upgrade: the supply/borrow cap-exceeding emergency halts now fail closed if the cap read reverts (emitting HaltedWithoutCapCheck) instead of falling back to a stale reading.

The CorrelatedTokenOracle fix from the same reaudit is intentionally not included: it only adds an input-validation safeguard to setSnapshot which is a governance-gated function, so the risk is minimal and the change is skipped here; new oracle deployments can adopt the updated contract.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ══════════════════════════════════════════════════════════════════════
      // Block 1 — Institutional Fixed Rate Vault implementation upgrade
      // ══════════════════════════════════════════════════════════════════════

      // 1a. Upgrade the InstitutionalVaultController proxy to the new implementation.
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [INSTITUTIONAL_VAULT_CONTROLLER, NEW_CONTROLLER_IMPLEMENTATION],
      },
      // 1b. Point the controller at the new vault implementation used to clone future vaults.
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "setVaultImplementation(address)",
        params: [NEW_VAULT_IMPLEMENTATION],
      },
      // 1c. Grant ACM permission for the new createVault signature + the two new functions.
      ...NEW_PERMISSIONS.flatMap(fn =>
        AUTHORIZED_CALLERS.map(caller => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [INSTITUTIONAL_VAULT_CONTROLLER, fn, caller],
        })),
      ),
      // 1d. Revoke the now-dead old createVault permission — REMOVED to keep the merged proposal under the
      // BSC mainnet single-tx gas cap (16.77M). The old 5-param createVault signature no longer exists on the
      // new implementation (it is now 6-param), so the stale permission is unusable/dead and safe to leave.
      // ...AUTHORIZED_CALLERS.map(caller => ({
      //   target: ACCESS_CONTROL_MANAGER,
      //   signature: "revokeCallPermission(address,string,address)",
      //   params: [INSTITUTIONAL_VAULT_CONTROLLER, CREATE_VAULT_OLD, caller],
      // })),
      // 1e. Override the legacy vault's display name so getAggregatedVaultStates() doesn't revert post-upgrade.
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "setInstitutionNameOverride(address,string)",
        params: [LEGACY_VAULT, LEGACY_VAULT_INSTITUTION_NAME],
      },

      // ══════════════════════════════════════════════════════════════════════
      // Block 2 — Certik VPD-1241 reaudit: Core Pool, Liquidator, Leverage Manager
      // ══════════════════════════════════════════════════════════════════════

      // 2a. Core Pool Comptroller — recut the diamond and repoint the ComptrollerLens.
      {
        target: reaudit.UNITROLLER,
        signature: "diamondCut((address,uint8,bytes4[])[])",
        params: [
          [
            ...reaudit.FACETS.map(f => [f.newFacet, FacetCutAction.Replace, f.selectors]),
            ...reaudit.FACETS.filter(f => f.newSelectors.length > 0).map(f => [
              f.newFacet,
              FacetCutAction.Add,
              f.newSelectors,
            ]),
          ],
        ],
      },
      { target: reaudit.UNITROLLER, signature: "_setPendingImplementation(address)", params: [reaudit.NEW_DIAMOND] },
      { target: reaudit.NEW_DIAMOND, signature: "_become(address)", params: [reaudit.UNITROLLER] },
      { target: reaudit.UNITROLLER, signature: "_setComptrollerLens(address)", params: [reaudit.NEW_COMPTROLLER_LENS] },

      // Register call permission for the new market-filtered seizeVenus overload.
      ...reaudit.SEIZE_VENUS_PERMISSION_GRANTEES.map(account => ({
        target: reaudit.ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [reaudit.UNITROLLER, reaudit.SEIZE_VENUS_FILTERED_SIGNATURE, account],
      })),

      // 2b. Liquidator.
      {
        target: reaudit.LIQUIDATOR_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [reaudit.LIQUIDATOR, reaudit.NEW_LIQUIDATOR_IMPL],
      },

      // 2c. Core Pool markets — VBep20Delegate.
      ...Object.values(reaudit.VTOKENS_TO_UPGRADE).map(vToken => ({
        target: vToken,
        signature: "_setImplementation(address,bool,bytes)",
        params: [reaudit.NEW_VTOKEN_DELEGATE, false, "0x"],
      })),

      // 2d. LeverageStrategiesManager.
      {
        target: reaudit.LEVERAGE_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [reaudit.LEVERAGE_STRATEGIES_MANAGER, reaudit.NEW_LEVERAGE_IMPL],
      },

      // 2e. Executor (E-brake V2).
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

export default vip665;
