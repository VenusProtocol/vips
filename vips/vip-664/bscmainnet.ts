import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const {
  NORMAL_TIMELOCK: NORMAL,
  FAST_TRACK_TIMELOCK: FAST_TRACK,
  CRITICAL_TIMELOCK: CRITICAL,
  GUARDIAN,
  ACCESS_CONTROL_MANAGER,
} = NETWORK_ADDRESSES.bscmainnet;

export interface PermissionEntry {
  target: string;
  fn: string;
  callers: string[];
}

// Deployed addresses (TODO: replace with mainnet addresses before proposing)
export const INSTITUTIONAL_VAULT_CONTROLLER = "0x0000000000000000000000000000000000000000";
export const LIQUIDATION_ADAPTER = "0x0000000000000000000000000000000000000000";
export const INSTITUTION_POSITION_TOKEN = "0x0000000000000000000000000000000000000000";

// ACM aggregator (mainnet)
export const ACM_AGGREGATOR = "0x8b443Ea6726E56DF4C4F62f80F0556bB9B2a7c64";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR_INDEX = 1;

export const LIQUIDATOR_WHITELIST: string[] = []; // TBD: populate before proposing.
export const SETTLER_WHITELIST: string[] = []; // TBD: populate before proposing.

export const PERMISSION_ENTRIES: PermissionEntry[] = [
  // InstitutionalVaultController
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "acceptPositionTokenOwnership()", callers: [NORMAL] },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "createVault(VaultConfig,InstitutionalConfig,RiskConfig,string,string)",
    callers: [NORMAL, FAST_TRACK, CRITICAL],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "openVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "partialPauseVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "completePauseVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "unpauseVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "closeVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "sweep(address,address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "approvePositionTransfer(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "revokePositionTransfer(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "setLiquidationThreshold(address,uint256)",
    callers: [NORMAL, FAST_TRACK, CRITICAL],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "setLiquidationIncentive(address,uint256)",
    callers: [NORMAL, FAST_TRACK, CRITICAL],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "setLatePenaltyRate(address,uint256)",
    callers: [NORMAL, FAST_TRACK, CRITICAL],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "setVaultImplementation(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL],
  },
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "setLiquidationAdapter(address)", callers: [NORMAL, GUARDIAN] },
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "setOracle(address)", callers: [NORMAL, GUARDIAN] },
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "setProtocolShareReserve(address)", callers: [NORMAL, GUARDIAN] },
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "setComptroller(address)", callers: [NORMAL, GUARDIAN] },
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "setTreasury(address)", callers: [NORMAL, GUARDIAN] },

  // LiquidationAdapter
  {
    target: LIQUIDATION_ADAPTER,
    fn: "setLiquidatorWhitelist(address,bool)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: LIQUIDATION_ADAPTER,
    fn: "setSettlerWhitelist(address,bool)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  { target: LIQUIDATION_ADAPTER, fn: "setProtocolLiquidationShare(uint256)", callers: [NORMAL, FAST_TRACK, CRITICAL] },
  { target: LIQUIDATION_ADAPTER, fn: "setCloseFactor(uint256)", callers: [NORMAL, FAST_TRACK, CRITICAL] },
  {
    target: LIQUIDATION_ADAPTER,
    fn: "sweepProtocolShareToReserve(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
];

export const buildPermissions = (table: PermissionEntry[]): [string, string, string][] =>
  table.flatMap(({ target, fn, callers }) => callers.map(c => [target, fn, c] as [string, string, string]));

export const PERMISSIONS: [string, string, string][] = buildPermissions(PERMISSION_ENTRIES);

export const EXPECTED_PERMISSION_GRANTED_EVENTS = PERMISSIONS.length;

export const vip664 = () => {
  const meta = {
    version: "v1",
    title: "VIP-664 [BNB Chain] Configure Institutional Fixed Rate Vault System",
    description: `#### Summary

If passed, this VIP will configure the Institutional Fixed Rate Vault system on BNB Chain:

1. Grant ACM permissions (${EXPECTED_PERMISSION_GRANTED_EVENTS} total) via \`ACMCommandsAggregator\` to the appropriate set of timelocks (Normal, Fast-track, Critical) and the Guardian for each access-controlled function on \`InstitutionalVaultController\` and \`LiquidationAdapter\`.
2. Accept ownership of \`InstitutionalVaultController\` and \`LiquidationAdapter\` (two-step Ownable2Step transfer initiated in deploy script).
3. Set the \`LiquidationAdapter\` on the controller via \`setLiquidationAdapter()\`.
4. Complete the two-step position token ownership transfer via \`acceptPositionTokenOwnership()\`.
5. Whitelist a dedicated set of liquidator and settler addresses on the \`LiquidationAdapter\`.

#### Deployed Contracts

- **InstitutionalVaultController** (proxy): ${INSTITUTIONAL_VAULT_CONTROLLER}
- **LiquidationAdapter** (proxy): ${LIQUIDATION_ADAPTER}
- **InstitutionPositionToken**: ${INSTITUTION_POSITION_TOKEN}`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Phase 1 — Load and execute the ACM permission batch via the aggregator.
      {
        target: ACM_AGGREGATOR,
        signature: "addGrantPermissions((address,string,address)[])",
        params: [PERMISSIONS],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "grantRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
      },
      {
        target: ACM_AGGREGATOR,
        signature: "executeGrantPermissions(uint256)",
        params: [ACM_AGGREGATOR_INDEX],
      },
      {
        target: ACCESS_CONTROL_MANAGER,
        signature: "revokeRole(bytes32,address)",
        params: [DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR],
      },

      // Phase 2 — Complete Ownable2Step transfers (initiated in deploy script).
      { target: INSTITUTIONAL_VAULT_CONTROLLER, signature: "acceptOwnership()", params: [] },
      { target: LIQUIDATION_ADAPTER, signature: "acceptOwnership()", params: [] },

      // Phase 3 — Wire adapter into controller and accept position-token ownership.
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "setLiquidationAdapter(address)",
        params: [LIQUIDATION_ADAPTER],
      },
      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "acceptPositionTokenOwnership()",
        params: [],
      },

      // Phase 4 — Whitelist dedicated liquidator/settler addresses on the adapter.
      ...LIQUIDATOR_WHITELIST.map(account => ({
        target: LIQUIDATION_ADAPTER,
        signature: "setLiquidatorWhitelist(address,bool)",
        params: [account, true],
      })),
      ...SETTLER_WHITELIST.map(account => ({
        target: LIQUIDATION_ADAPTER,
        signature: "setSettlerWhitelist(address,bool)",
        params: [account, true],
      })),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
