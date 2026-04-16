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

export const CONTROLLER_FAST_TRACK_FUNCTIONS = [
  "partialPauseVault(address)",
  "completePauseVault(address)",
  "unpauseVault(address)",
  "setLiquidationThreshold(address,uint256)",
  "setLiquidationIncentive(address,uint256)",
  "setLatePenaltyRate(address,uint256)",
];

export const CONTROLLER_CRITICAL_FUNCTIONS = ["partialPauseVault(address)", "completePauseVault(address)"];

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

export const ADAPTER_FAST_TRACK_FUNCTIONS = ["setProtocolLiquidationShare(uint256)", "setCloseFactor(uint256)"];

// Total PermissionGranted events: 19 + 6 + 2 + 2 + 5 + 2 = 36
export const EXPECTED_PERMISSION_GRANTED_EVENTS = 36;

/**
 * Returns a giveCallPermission command for the ACM.
 * @param contract  Target contract the permission applies to.
 * @param funcSig   Exact Solidity function signature string (must match _checkAccessAllowed).
 * @param account   Address being granted the permission.
 */
const permission = (contract: string, funcSig: string, account: string) => ({
  target: ACCESS_CONTROL_MANAGER,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, funcSig, account],
});

export const vip664 = () => {
  const meta = {
    version: "v1",
    title: "VIP-664 [BNB Chain Testnet] Configure Institutional Fixed Rate Vault System",
    description: `#### Summary

If passed, this VIP will configure the Institutional Fixed Rate Vault system on BNB Chain Testnet:

1. Grant ACM permissions to governance timelocks for all access-controlled functions on \`InstitutionalVaultController\` and \`LiquidationAdapter\`.
2. Set the \`LiquidationAdapter\` on the controller via \`setLiquidationAdapter()\`.
3. Complete the two-step position token ownership transfer via \`acceptPositionTokenOwnership()\`.

#### Deployed Contracts

- **InstitutionalVaultController** (proxy): ${INSTITUTIONAL_VAULT_CONTROLLER}
- **LiquidationAdapter** (proxy): ${LIQUIDATION_ADAPTER}
- **InstitutionPositionToken**: ${INSTITUTION_POSITION_TOKEN}

#### Permission Summary

| Timelock | Contract | Permissions |
|---|---|---|
| Normal | InstitutionalVaultController | 19 functions (all operational + setter functions) |
| Fast-track | InstitutionalVaultController | 6 functions (pause + risk params) |
| Critical | InstitutionalVaultController | 2 functions (pause only) |
| Guardian | InstitutionalVaultController | 2 functions (pause only) |
| Normal | LiquidationAdapter | 5 functions (all setter functions) |
| Fast-track | LiquidationAdapter | 2 functions (risk params) |`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // ──────────────────────────────────────────────────────────────────────
      // Phase 1 — InstitutionalVaultController permissions
      // ──────────────────────────────────────────────────────────────────────

      // NORMAL_TIMELOCK — all 19 ACM-gated controller functions
      ...CONTROLLER_FUNCTIONS.map(sig => permission(INSTITUTIONAL_VAULT_CONTROLLER, sig, NORMAL_TIMELOCK)),

      // FAST_TRACK_TIMELOCK — emergency pause + risk parameter functions
      ...CONTROLLER_FAST_TRACK_FUNCTIONS.map(sig =>
        permission(INSTITUTIONAL_VAULT_CONTROLLER, sig, FAST_TRACK_TIMELOCK),
      ),

      // CRITICAL_TIMELOCK — critical pause functions only
      ...CONTROLLER_CRITICAL_FUNCTIONS.map(sig => permission(INSTITUTIONAL_VAULT_CONTROLLER, sig, CRITICAL_TIMELOCK)),

      // GUARDIAN — critical pause functions
      ...CONTROLLER_CRITICAL_FUNCTIONS.map(sig => permission(INSTITUTIONAL_VAULT_CONTROLLER, sig, GUARDIAN)),

      // ──────────────────────────────────────────────────────────────────────
      // Phase 2 — LiquidationAdapter permissions
      // ──────────────────────────────────────────────────────────────────────

      // NORMAL_TIMELOCK — all 5 ACM-gated adapter functions
      ...ADAPTER_FUNCTIONS.map(sig => permission(LIQUIDATION_ADAPTER, sig, NORMAL_TIMELOCK)),

      // FAST_TRACK_TIMELOCK — risk parameter functions
      ...ADAPTER_FAST_TRACK_FUNCTIONS.map(sig => permission(LIQUIDATION_ADAPTER, sig, FAST_TRACK_TIMELOCK)),

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
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
