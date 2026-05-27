import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const {
  NORMAL_TIMELOCK: NORMAL,
  FAST_TRACK_TIMELOCK: FAST_TRACK,
  CRITICAL_TIMELOCK: CRITICAL,
  GUARDIAN,
  ACCESS_CONTROL_MANAGER,
} = NETWORK_ADDRESSES.bsctestnet;

export interface PermissionEntry {
  target: string;
  fn: string;
  callers: string[];
}

// Redeployed addresses (TODO: replace once new testnet deployment is complete)
export const INSTITUTIONAL_VAULT_CONTROLLER = "0xf77dED2A00F94e33C392126238360D4642c16Ba2";
export const LIQUIDATION_ADAPTER = "0x4b302b56315Ca16A0A4565108e62404496916491";
export const INSTITUTION_POSITION_TOKEN = "0x71dA473257a96e975558C8edD8491AD0880EFCe5";

// ProtocolShareReserve upgrade (adds support for the institutional-vault liquidation income type).
export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const NEW_PSR_IMPLEMENTATION = "0x6eFa596c53E6A753DdA643e3e3FEcA1570879b7C";

// ACM aggregator (existing testnet deployment).
// Index is incremented because index 1 was consumed by the original VIP-664 pre-load.
export const ACM_AGGREGATOR = "0xB59523628D92f914ec6624Be4281397E8aFD71EF";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR_INDEX = 2;

// Liquidator/settler addresses whitelisted on the `LiquidationAdapter`.
// Guardian is whitelisted on testnet for operational convenience.
export const LIQUIDATOR_WHITELIST: string[] = [GUARDIAN];
export const SETTLER_WHITELIST: string[] = [GUARDIAN];

export const PERMISSION_ENTRIES: PermissionEntry[] = [
  // InstitutionalVaultController
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "acceptPositionTokenOwnership()", callers: [NORMAL] },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "createVault(VaultConfig,InstitutionalConfig,RiskConfig,string,string)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
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
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "revokePositionTransfer(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "setLiquidationThreshold(address,uint256)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "setLiquidationIncentive(address,uint256)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "setLatePenaltyRate(address,uint256)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
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
  {
    target: LIQUIDATION_ADAPTER,
    fn: "setProtocolLiquidationShare(uint256)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN],
  },
  { target: LIQUIDATION_ADAPTER, fn: "setCloseFactor(uint256)", callers: [NORMAL, FAST_TRACK, CRITICAL, GUARDIAN] },
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

export const vip664TestnetAddendum = () => {
  const meta = {
    version: "v1",
    title: "VIP-664 Addendum [BNB Chain Testnet] Configure redeployed Institutional Fixed Rate Vault System",
    description: `#### Summary

The Institutional Fixed Rate Vault contracts were redeployed on BNB Chain Testnet. This addendum
re-runs the configuration against the new contract addresses, following the same flow used in the
[VIP-664 BNB mainnet proposal](../bscmainnet.ts). Permissions are pre-loaded into the
\`ACMCommandsAggregator\` off-chain via \`addGrantPermissions.ts\`; the VIP only executes the batch.

If passed, this VIP will:

1. Execute the pre-loaded ACM permission batch (${EXPECTED_PERMISSION_GRANTED_EVENTS} total grants) via \`ACMCommandsAggregator\`:
   - \`grantRole(DEFAULT_ADMIN_ROLE, aggregator)\` so the aggregator can apply grants
   - \`executeGrantPermissions\` to apply all permissions atomically
   - \`revokeRole(DEFAULT_ADMIN_ROLE, aggregator)\` to remove the elevated role
2. Accept ownership of \`InstitutionalVaultController\` and \`LiquidationAdapter\` (two-step Ownable2Step transfer initiated in deploy script).
3. Set the \`LiquidationAdapter\` on the controller via \`setLiquidationAdapter()\`.
4. Complete the two-step position token ownership transfer via \`acceptPositionTokenOwnership()\`.
5. Whitelist the Guardian as a liquidator and settler on the \`LiquidationAdapter\`.
6. Upgrade the \`ProtocolShareReserve\` proxy to a new implementation that supports the institutional-vault liquidation income type.

#### Deployed Contracts (redeployed)

- **InstitutionalVaultController** (proxy): ${INSTITUTIONAL_VAULT_CONTROLLER}
- **LiquidationAdapter** (proxy): ${LIQUIDATION_ADAPTER}
- **InstitutionPositionToken**: ${INSTITUTION_POSITION_TOKEN}
- **ProtocolShareReserve** (proxy): ${PROTOCOL_SHARE_RESERVE}
- **New ProtocolShareReserve implementation**: ${NEW_PSR_IMPLEMENTATION}`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Step 1 — Execute the ACM permission batch via the aggregator.
      // Permissions are pre-loaded into the aggregator off-chain via addGrantPermissions.ts.
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

      // Step 2 — Complete Ownable2Step transfers (initiated in deploy script).
      { target: INSTITUTIONAL_VAULT_CONTROLLER, signature: "acceptOwnership()", params: [] },
      { target: LIQUIDATION_ADAPTER, signature: "acceptOwnership()", params: [] },

      // Step 3 — Wire adapter into controller and accept position-token ownership.
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

      // Step 4 — Whitelist dedicated liquidator/settler addresses on the adapter.
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

      // Step 5 — Upgrade the ProtocolShareReserve
      {
        target: PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [PROTOCOL_SHARE_RESERVE, NEW_PSR_IMPLEMENTATION],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664TestnetAddendum;
