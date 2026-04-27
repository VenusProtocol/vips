import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
const { NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_TIMELOCK, GUARDIAN, ACCESS_CONTROL_MANAGER } = bsctestnet;

// ──────────────────────────────────────────────────────────────────────
// Deployed addresses
// ──────────────────────────────────────────────────────────────────────

export const INSTITUTIONAL_VAULT_CONTROLLER = "0x36bA78812Ffff64B9ec060a1F07FcFa2012f6F89";
export const LIQUIDATION_ADAPTER = "0x69d79D60abD5A7080C9f178a44c5f1bf1A461541";
export const INSTITUTION_POSITION_TOKEN = "0x377180882397718D4061d815Df32CF7DF8492f4F";

// ──────────────────────────────────────────────────────────────────────
// ACM Aggregator
// ──────────────────────────────────────────────────────────────────────

export const ACM_AGGREGATOR = "0xB59523628D92f914ec6624Be4281397E8aFD71EF";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const ACM_AGGREGATOR_INDEX = 1;

// ──────────────────────────────────────────────────────────────────────
// ACM-gated function signatures — InstitutionalVaultController
// ──────────────────────────────────────────────────────────────────────

export const CONTROLLER_FUNCTIONS = [
  "acceptPositionTokenOwnership()",
  "createVault(VaultConfig,InstitutionalConfig,RiskConfig,string,string)",
  "openVault(address)",
  "partialPauseVault(address)",
  "completePauseVault(address)",
  "unpauseVault(address)",
  "closeVault(address)",
  "sweep(address,address)",
  "approvePositionTransfer(address)",
  "revokePositionTransfer(address)",
  "setLiquidationThreshold(address,uint256)",
  "setLiquidationIncentive(address,uint256)",
  "setLatePenaltyRate(address,uint256)",
  "setVaultImplementation(address)",
  "setLiquidationAdapter(address)",
  "setOracle(address)",
  "setProtocolShareReserve(address)",
  "setComptroller(address)",
  "setTreasury(address)",
];

export const CONTROLLER_GUARDIAN_FUNCTIONS = [
  "partialPauseVault(address)",
  "completePauseVault(address)",
  "unpauseVault(address)",
  "openVault(address)",
  "closeVault(address)",
  "sweep(address,address)",
];

// ──────────────────────────────────────────────────────────────────────
// ACM-gated function signatures — LiquidationAdapter
// ──────────────────────────────────────────────────────────────────────

export const ADAPTER_FUNCTIONS = [
  "setLiquidatorWhitelist(address,bool)",
  "setSettlerWhitelist(address,bool)",
  "setProtocolLiquidationShare(uint256)",
  "setCloseFactor(uint256)",
  "sweepProtocolShareToReserve(address)",
];

export const ADAPTER_GUARDIAN_FUNCTIONS = [
  "sweepProtocolShareToReserve(address)",
  "setSettlerWhitelist(address,bool)",
  "setLiquidatorWhitelist(address,bool)",
];

// Total PermissionGranted events: 19*3 + 6 + 5*3 + 3 = 81
export const EXPECTED_PERMISSION_GRANTED_EVENTS = 81;

// ──────────────────────────────────────────────────────────────────────
// Full permissions array (pre-loaded into ACM Aggregator via script)
// ──────────────────────────────────────────────────────────────────────

export const PERMISSIONS: [string, string, string][] = [
  // InstitutionalVaultController — all 19 functions × 3 timelocks
  ...CONTROLLER_FUNCTIONS.flatMap(sig => [
    [INSTITUTIONAL_VAULT_CONTROLLER, sig, NORMAL_TIMELOCK] as [string, string, string],
    [INSTITUTIONAL_VAULT_CONTROLLER, sig, FAST_TRACK_TIMELOCK] as [string, string, string],
    [INSTITUTIONAL_VAULT_CONTROLLER, sig, CRITICAL_TIMELOCK] as [string, string, string],
  ]),

  // InstitutionalVaultController — 6 guardian functions
  ...CONTROLLER_GUARDIAN_FUNCTIONS.map(
    sig => [INSTITUTIONAL_VAULT_CONTROLLER, sig, GUARDIAN] as [string, string, string],
  ),

  // LiquidationAdapter — all 5 functions × 3 timelocks
  ...ADAPTER_FUNCTIONS.flatMap(sig => [
    [LIQUIDATION_ADAPTER, sig, NORMAL_TIMELOCK] as [string, string, string],
    [LIQUIDATION_ADAPTER, sig, FAST_TRACK_TIMELOCK] as [string, string, string],
    [LIQUIDATION_ADAPTER, sig, CRITICAL_TIMELOCK] as [string, string, string],
  ]),

  // LiquidationAdapter — 3 guardian functions
  ...ADAPTER_GUARDIAN_FUNCTIONS.map(sig => [LIQUIDATION_ADAPTER, sig, GUARDIAN] as [string, string, string]),
];

export const vip664 = () => {
  const meta = {
    version: "v1",
    title: "VIP-664 [BNB Chain Testnet] Configure Institutional Fixed Rate Vault System",
    description: `#### Summary

If passed, this VIP will configure the Institutional Fixed Rate Vault system on BNB Chain Testnet:

1. Grant ACM permissions (81 total) via \`ACMCommandsAggregator\` to all three governance timelocks (Normal, Fast-track, Critical) for all access-controlled functions on \`InstitutionalVaultController\` and \`LiquidationAdapter\`, and to the Guardian for operational functions on both contracts.
2. Accept ownership of \`InstitutionalVaultController\` and \`LiquidationAdapter\` (two-step Ownable2Step transfer initiated in deploy script).
3. Set the \`LiquidationAdapter\` on the controller via \`setLiquidationAdapter()\`.
4. Complete the two-step position token ownership transfer via \`acceptPositionTokenOwnership()\`.
5. Whitelist the Guardian as a liquidator and settler on the \`LiquidationAdapter\`.

#### Deployed Contracts

- **InstitutionalVaultController** (proxy): ${INSTITUTIONAL_VAULT_CONTROLLER}
- **LiquidationAdapter** (proxy): ${LIQUIDATION_ADAPTER}
- **InstitutionPositionToken**: ${INSTITUTION_POSITION_TOKEN}

#### Permission Summary

| Timelock | Contract | Permissions |
|---|---|---|
| Normal | InstitutionalVaultController | 19 functions (all operational + setter functions) |
| Fast-track | InstitutionalVaultController | 19 functions (all operational + setter functions) |
| Critical | InstitutionalVaultController | 19 functions (all operational + setter functions) |
| Guardian | InstitutionalVaultController | 6 functions (pause/unpause + open/close/sweep) |
| Normal | LiquidationAdapter | 5 functions (all setter functions) |
| Fast-track | LiquidationAdapter | 5 functions (all setter functions) |
| Critical | LiquidationAdapter | 5 functions (all setter functions) |
| Guardian | LiquidationAdapter | 3 functions (sweep + whitelist management) |`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────
      // Phase 1 — ACM permissions via Aggregator
      // ──────────────────────────────────────────────────────────────────────
      // Permissions were pre-loaded into ACM Aggregator via addGrantPermissions.ts.
      // Grant admin role, execute batched permissions, then revoke admin role.

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

      // ──────────────────────────────────────────────────────────────────────
      // Phase 2 — Ownership acceptance
      // ──────────────────────────────────────────────────────────────────────
      // Deploy script called transferOwnership(NORMAL_TIMELOCK) on both contracts.
      // acceptOwnership() completes the Ownable2Step transfer.

      {
        target: INSTITUTIONAL_VAULT_CONTROLLER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: LIQUIDATION_ADAPTER,
        signature: "acceptOwnership()",
        params: [],
      },

      // ──────────────────────────────────────────────────────────────────────
      // Phase 3 — System wiring
      // ──────────────────────────────────────────────────────────────────────
      // Note: NORMAL_TIMELOCK must have the ACM permission for both calls below,
      // which is granted in Phase 1 above. Commands execute atomically in order.

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

      // ──────────────────────────────────────────────────────────────────────
      // Phase 4 — Guardian whitelist configuration
      // ──────────────────────────────────────────────────────────────────────

      {
        target: LIQUIDATION_ADAPTER,
        signature: "setLiquidatorWhitelist(address,bool)",
        params: [GUARDIAN, true],
      },
      {
        target: LIQUIDATION_ADAPTER,
        signature: "setSettlerWhitelist(address,bool)",
        params: [GUARDIAN, true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
