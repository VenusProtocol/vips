import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN, ACCESS_CONTROL_MANAGER } =
  NETWORK_ADDRESSES.bsctestnet;

// Institutional Fixed Rate Vault — implementation upgrade (VPD-1488)

export const INSTITUTIONAL_VAULT_CONTROLLER = "0xf77dED2A00F94e33C392126238360D4642c16Ba2";
export const PROXY_ADMIN = "0x7877fFd62649b6A1557B55D4c20fcBaB17344C91";

export const OLD_CONTROLLER_IMPLEMENTATION = "0xb92CEd5Fc18b58323B056168764fb5320eDfD1aF";
export const OLD_VAULT_IMPLEMENTATION = "0x1e311a618e748367D40F84cdb32211F1376B996F";

export const NEW_CONTROLLER_IMPLEMENTATION = "0xEb8Ca841cBe1BC4832A10b15c7dAB1081eDaD371";
export const NEW_VAULT_IMPLEMENTATION = "0x97421799419Eb782628e73e7220d8E0A207469a3";

export const CALLERS = [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN];

// createVault gained a third string param, so its old permission must be re-granted and revoked.
export const CREATE_VAULT_OLD = "createVault(VaultConfig,InstitutionalConfig,RiskConfig,string,string)";
export const CREATE_VAULT_NEW = "createVault(VaultConfig,InstitutionalConfig,RiskConfig,string,string,string)";
export const SET_INSTITUTION_NAME = "setInstitutionName(address,string)";
export const SET_INSTITUTION_NAME_OVERRIDE = "setInstitutionNameOverride(address,string)";

export const NEW_PERMISSIONS = [CREATE_VAULT_NEW, SET_INSTITUTION_NAME, SET_INSTITUTION_NAME_OVERRIDE];

export const vip665 = () => {
  const meta = {
    version: "v2",
    title: "VIP-665 [BNB Chain Testnet] Upgrade Institutional Fixed Rate Vault implementations",
    description: `#### Summary

If passed, this VIP will upgrade the Institutional Fixed Rate Vault implementations on BNB Chain Testnet:

1. Upgrade the \`InstitutionalVaultController\` transparent proxy to a new implementation via the \`ProxyAdmin\`.
2. Update the vault implementation used by the controller to clone new vaults via \`setVaultImplementation()\`.
   Existing vault clones are immutable (EIP-1167 minimal proxies); this only affects vaults created from now on.
3. Re-grant ACM permission for \`createVault\`: the new implementation appends a third \`string\`
   (\`institutionName\`) to the signature, so the previously granted \`${CREATE_VAULT_OLD}\` no longer matches.
   The new \`${CREATE_VAULT_NEW}\` is granted to the Normal / Fast-track / Critical timelocks and the Guardian,
   and the stale old permission is revoked.
4. Grant ACM permission for the two new controller functions \`${SET_INSTITUTION_NAME}\` and
   \`${SET_INSTITUTION_NAME_OVERRIDE}\` to the same callers.

The new implementations add a renamable \`institutionName\` as a **standalone field on the vault**, leaving the
\`InstitutionalConfig\` struct — and therefore \`institutionalConfig()\`'s ABI — unchanged, so existing vault
clones remain fully decodable. The controller also gains an \`institutionNameOverride\` mapping used by
\`getAggregatedVaultStates()\` to supply a display name for legacy vaults that predate the on-chain field.

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
        CALLERS.map(caller => ({
          target: ACCESS_CONTROL_MANAGER,
          signature: "giveCallPermission(address,string,address)",
          params: [INSTITUTIONAL_VAULT_CONTROLLER, fn, caller],
        })),
      ),
      // 4. Revoke the now-dead old createVault permission (superseded by the new signature).
      ...CALLERS.map(caller => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "revokeCallPermission(address,string,address)",
        params: [INSTITUTIONAL_VAULT_CONTROLLER, CREATE_VAULT_OLD, caller],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip665;
