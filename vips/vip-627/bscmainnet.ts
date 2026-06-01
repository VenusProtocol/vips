import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const {
  NORMAL_TIMELOCK: NORMAL,
  FAST_TRACK_TIMELOCK: FAST_TRACK,
  CRITICAL_TIMELOCK: CRITICAL,
  CRITICAL_GUARDIAN,
  ACCESS_CONTROL_MANAGER,
} = NETWORK_ADDRESSES.bscmainnet;

export interface PermissionEntry {
  target: string;
  fn: string;
  callers: string[];
}

// Deployed addresses
export const INSTITUTIONAL_VAULT_CONTROLLER = "0x6D9e91cB766259af42619c14c994E694E57e6E85";
export const LIQUIDATION_ADAPTER = "0x17A6222fB8b4b6D852cA54f5bc376a6A2c6224Bd";
export const INSTITUTION_POSITION_TOKEN = "0x3Ed56f6937fc8549f9325405d1e8E650739647Fa";

// ProtocolShareReserve upgrade
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const PROXY_ADMIN = "0x6beb6d2695b67feb73ad4f172e8e2975497187e4";
export const NEW_PSR_IMPLEMENTATION = "0x4eC6D748a2647000895b455c408f85602A144Ed6";

// ACM aggregator (mainnet)
export const ACM_AGGREGATOR = "0x8b443Ea6726E56DF4C4F62f80F0556bB9B2a7c64";
export const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const ACM_AGGREGATOR_INDEX = 3;

export const LIQUIDATOR_WHITELIST: string[] = [CRITICAL_GUARDIAN];
export const SETTLER_WHITELIST: string[] = [CRITICAL_GUARDIAN];

export const PERMISSION_ENTRIES: PermissionEntry[] = [
  // InstitutionalVaultController
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "acceptPositionTokenOwnership()", callers: [NORMAL] },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "createVault(VaultConfig,InstitutionalConfig,RiskConfig,string,string)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "openVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "cancelVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "partialPauseVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "completePauseVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "unpauseVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "closeVault(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "sweep(address,address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "approvePositionTransfer(address,address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "revokePositionTransfer(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
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
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "setLiquidationAdapter(address)",
    callers: [NORMAL, CRITICAL_GUARDIAN],
  },
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "setOracle(address)", callers: [NORMAL, CRITICAL_GUARDIAN] },
  {
    target: INSTITUTIONAL_VAULT_CONTROLLER,
    fn: "setProtocolShareReserve(address)",
    callers: [NORMAL, CRITICAL_GUARDIAN],
  },
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "setComptroller(address)", callers: [NORMAL, CRITICAL_GUARDIAN] },
  { target: INSTITUTIONAL_VAULT_CONTROLLER, fn: "setTreasury(address)", callers: [NORMAL, CRITICAL_GUARDIAN] },

  // LiquidationAdapter
  {
    target: LIQUIDATION_ADAPTER,
    fn: "setLiquidatorWhitelist(address,bool)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  {
    target: LIQUIDATION_ADAPTER,
    fn: "setSettlerWhitelist(address,bool)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
  { target: LIQUIDATION_ADAPTER, fn: "setProtocolLiquidationShare(uint256)", callers: [NORMAL, FAST_TRACK, CRITICAL] },
  // NORMAL already holds setCloseFactor globally on mainnet.
  { target: LIQUIDATION_ADAPTER, fn: "setCloseFactor(uint256)", callers: [FAST_TRACK, CRITICAL] },
  {
    target: LIQUIDATION_ADAPTER,
    fn: "sweepProtocolShareToReserve(address)",
    callers: [NORMAL, FAST_TRACK, CRITICAL, CRITICAL_GUARDIAN],
  },
];

export const buildPermissions = (table: PermissionEntry[]): [string, string, string][] =>
  table.flatMap(({ target, fn, callers }) => callers.map(c => [target, fn, c] as [string, string, string]));

export const PERMISSIONS: [string, string, string][] = buildPermissions(PERMISSION_ENTRIES);

export const EXPECTED_PERMISSION_GRANTED_EVENTS = PERMISSIONS.length;

export const vip627 = () => {
  const meta = {
    version: "v1",
    title: "VIP-627 [BNB Chain] Activate Institutional Fixed Rate Vault System",
    description: `#### Summary

If passed, this VIP activates the Institutional Fixed Rate Vault system on BNB Chain and upgrades the Protocol Share Reserve to support it. The new system introduces fixed-rate, time-bound vaults intended for whitelisted institutional borrowers, with a dedicated liquidation flow separate from the existing core pool.

#### Description

The proposal performs the following on-chain actions:

**1. Grant ACM permissions via the ACMCommandsAggregator**

Permissions for the new InstitutionalVaultController and LiquidationAdapter contracts have been pre-loaded off-chain into the ACMCommandsAggregator (index ${ACM_AGGREGATOR_INDEX}). The VIP temporarily grants the aggregator the DEFAULT_ADMIN_ROLE on the AccessControlManager, executes the batch, and revokes the role in the same proposal. This grants role-based access (${EXPECTED_PERMISSION_GRANTED_EVENTS} permissions in total) over all administrative functions of both contracts to the Normal / Fast-track / Critical timelocks and, where appropriate, the Critical Guardian.

- Vault lifecycle and operations (createVault, openVault, cancelVault, partialPauseVault, completePauseVault, unpauseVault, closeVault, sweep, approvePositionTransfer, revokePositionTransfer) — granted to all three timelocks and the Critical Guardian.
- Risk parameter setters (setLiquidationThreshold, setLiquidationIncentive, setLatePenaltyRate, setVaultImplementation) — granted to the three timelocks only.
- Plumbing setters (setLiquidationAdapter, setOracle, setProtocolShareReserve, setComptroller, setTreasury) — granted to the Normal Timelock and Critical Guardian.
- LiquidationAdapter controls (setLiquidatorWhitelist, setSettlerWhitelist, setProtocolLiquidationShare, setCloseFactor, sweepProtocolShareToReserve) — granted to the timelocks, with the whitelist and sweep functions also granted to the Critical Guardian.

**2. Complete two-step ownership transfers**

The InstitutionalVaultController, the LiquidationAdapter, and the InstitutionPositionToken were deployed with their Ownable2Step pending owner set to the Normal Timelock. The VIP calls acceptOwnership() on the controller and adapter, and acceptPositionTokenOwnership() on the controller (which in turn accepts ownership of the position-token NFT).

**3. Wire the LiquidationAdapter into the controller**

Call setLiquidationAdapter on the InstitutionalVaultController, pointing it at the newly deployed LiquidationAdapter.

**4. Whitelist the Critical Guardian as the initial liquidator and settler**

Whitelist the Critical Guardian on the LiquidationAdapter as both an authorized liquidator and an authorized settler, so that the dedicated liquidation flow can run under operational control while remaining governance-bounded.

**5. Upgrade the ProtocolShareReserve implementation**

Upgrade the ProtocolShareReserve proxy to a new implementation that recognises an additional income type produced by institutional-vault liquidations, so that protocol-share income flowing in from the LiquidationAdapter is routed and accounted for correctly.

#### Security and additional considerations

- The DEFAULT_ADMIN_ROLE grant to the ACMCommandsAggregator is scoped to this proposal: it is granted, used once to apply a pre-loaded permission batch, and revoked in the same transaction sequence.
- All sensitive risk-parameter changes (liquidation threshold, liquidation incentive, late-penalty rate, vault implementation) are restricted to timelock callers only and are not exposed to the Critical Guardian.
- The Critical Guardian initially fills the liquidator and settler roles on the LiquidationAdapter; additional whitelisted parties can be added later via subsequent VIPs.

#### Deployed contracts (BNB Chain)

- InstitutionalVaultController (proxy): ${INSTITUTIONAL_VAULT_CONTROLLER}
- LiquidationAdapter (proxy): ${LIQUIDATION_ADAPTER}
- InstitutionPositionToken: ${INSTITUTION_POSITION_TOKEN}
- ProtocolShareReserve (proxy): ${PROTOCOL_SHARE_RESERVE}
- New ProtocolShareReserve implementation: ${NEW_PSR_IMPLEMENTATION}
- ACMCommandsAggregator: ${ACM_AGGREGATOR} (batch index ${ACM_AGGREGATOR_INDEX})`,
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

      // Step 2 — Complete Ownable2Step transfers.
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

export default vip627;
