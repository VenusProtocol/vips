import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, CRITICAL_GUARDIAN, ACCESS_CONTROL_MANAGER } =
  NETWORK_ADDRESSES.bscmainnet;

// Institutional Fixed Rate Vault — implementation upgrade (VPD-1488)

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
    title: "VIP-665 [BNB Chain] Upgrade Institutional Fixed Rate Vault implementations",
    description: `#### Summary

If passed, this VIP will upgrade the Institutional Fixed Rate Vault implementations on BNB Chain:

1. Upgrade the \`InstitutionalVaultController\` transparent proxy to a new implementation via the \`ProxyAdmin\`.
2. Update the vault implementation used by the controller to clone new vaults via \`setVaultImplementation()\`.
   Existing vault clones are immutable (EIP-1167 minimal proxies); this only affects vaults created from now on.
3. Re-grant ACM permission for \`createVault\`: the new implementation appends a third \`string\`
   (\`institutionName\`) to the signature, so the previously granted \`${CREATE_VAULT_OLD}\` no longer matches.
   The new \`${CREATE_VAULT_NEW}\` is granted to the Normal / Fast-track / Critical timelocks and the Critical
   Guardian, and the stale old permission is revoked.
4. Grant ACM permission for the two new controller functions \`${SET_INSTITUTION_NAME}\` and
   \`${SET_INSTITUTION_NAME_OVERRIDE}\` to the same callers.
5. Set a display-name override (\`${LEGACY_VAULT_INSTITUTION_NAME}\`) for the single existing vault
   (\`${LEGACY_VAULT}\`) via \`setInstitutionNameOverride()\`. That vault was created on the old
   implementation and predates the on-chain \`institutionName\` field, so without an override
   \`getAggregatedVaultStates()\` would revert for it after the upgrade.

The new implementations add a renamable \`institutionName\` as a **standalone field on the vault**, leaving the
\`InstitutionalConfig\` struct — and therefore \`institutionalConfig()\`'s ABI — unchanged, so existing vault
clones remain fully decodable. The controller also gains an \`institutionNameOverride\` mapping used by
\`getAggregatedVaultStates()\` to supply a display name for legacy vaults that predate the on-chain field; the
override can be cleared by passing an empty string.

#### Upgrade details

| Contract | Proxy | Old implementation | New implementation |
|---|---|---|---|
| InstitutionalVaultController | ${INSTITUTIONAL_VAULT_CONTROLLER} | ${OLD_CONTROLLER_IMPLEMENTATION} | ${NEW_CONTROLLER_IMPLEMENTATION} |
| InstitutionalLoanVault (clone source) | n/a (cloned per vault) | ${OLD_VAULT_IMPLEMENTATION} | ${NEW_VAULT_IMPLEMENTATION} |

#### ProxyAdmin

- **ProxyAdmin**: ${PROXY_ADMIN}`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Upgrade the InstitutionalVaultController proxy to the new implementation.
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [INSTITUTIONAL_VAULT_CONTROLLER, NEW_CONTROLLER_IMPLEMENTATION],
      },
      // 2. Point the controller at the new vault implementation used to clone future vaults.
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "setVaultImplementation(address)",
        params: [NEW_VAULT_IMPLEMENTATION],
      },
      // 3. Grant ACM permission for the new createVault signature + the two new functions.
      ...NEW_PERMISSIONS.flatMap(fn =>
        AUTHORIZED_CALLERS.map(caller => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [INSTITUTIONAL_VAULT_CONTROLLER, fn, caller],
        })),
      ),
      // 4. Revoke the now-dead old createVault permission (superseded by the new signature).
      ...AUTHORIZED_CALLERS.map(caller => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "revokeCallPermission(address,string,address)",
        params: [INSTITUTIONAL_VAULT_CONTROLLER, CREATE_VAULT_OLD, caller],
      })),
      // 5. Override the legacy vault's display name so getAggregatedVaultStates() doesn't revert post-upgrade.
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "setInstitutionNameOverride(address,string)",
        params: [LEGACY_VAULT, LEGACY_VAULT_INSTITUTION_NAME],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip665;
