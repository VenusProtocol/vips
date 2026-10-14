import {
  APRO_ORACLE,
  ATLAS_ORACLE,
  BOUND_VALIDATOR,
  COLLATERAL_FACTORS_RISK_STEWARD,
  COLLATERAL_GATEWAY,
  CRITICAL_GUARDIAN,
  DEVIATION_BOUNDED_ORACLE,
  FAST_TRACK_TIMELOCK,
  HUB_STACKS,
  IRM_RISK_STEWARD,
  MARKET_CAPS_RISK_STEWARD,
  NORMAL_TIMELOCK,
  OPERATOR,
  PAUSE_GUARDIAN,
  RESILIENT_ORACLE,
  SPOKE_POOL_REGISTRY,
} from "./addresses/bscmainnet";
import {
  LOWER_RESOURCE_CAP,
  PAUSE_RESOURCE,
  PAUSE_ROLE,
  RAISE_RESOURCE_CAP,
  REGISTRY_DRIVEN_ROLES,
  ROUTER_ROLES,
  SET_ALLOWED_LIQUIDATOR,
  SET_CLOSE_FACTOR,
  SET_COLLATERAL_FACTOR,
  SET_FORCED_LIQUIDATION,
  SET_INNER_DEPOSIT_QUEUE,
  SET_INNER_WITHDRAW_QUEUE,
  SET_LIQUIDATION_ALLOWLIST_ENABLED,
  SET_LIQUIDATION_INCENTIVE,
  SET_MARKET_BORROW_CAPS,
  SET_MARKET_LIQUIDATION_INCENTIVE,
  SET_MARKET_SUPPLY_CAPS,
  SET_MIN_LIQUIDATABLE_COLLATERAL,
  SPOKE_COMPTROLLER_ROLES,
  SPOKE_SOURCE_ROLES,
  UNLIST_ROLE,
  UNPAUSE_RESOURCE,
  UPDATE_RESOURCE_ADAPTER,
} from "./permissions";

// ===================================================================================================
// VIP-671 [BNB Chain] — ACM grants for VIP-A (19 on `Comptroller_HubSpoke`, and four Risk Steward wildcards), VIP-B
// (on each Spoke source) and VIP-C (one, to `CollateralGateway`), and what each relies on.
//
// Every string is the literal the checking contract (`SpokeComptroller`, `PoolRegistry`, `VToken`, `YieldGroup`,
// `Hub`) passes to `_checkAccessAllowed`, imported from ./permissions.ts where it is shared.
//
// VIP-A's: read from the ACM 0x4788…3555 on 2026-10-13 (block 127,396,467) with `isAllowedToCall(account, role)`
// called from an UNRELATED `msg.sender`, so a `true` proves an address(0) wildcard rather than a grant against
// one contract. The mainnet ACM does not expose `hasPermission`. VIP-B's and VIP-C's are read in their own sections
// below.
// ===================================================================================================

type Grant = { role: string; account: string };

/// The six setters `PoolRegistry` drives on the comptroller as `msg.sender` during `addPool` and `addMarket`.
/// The isolated-pools registry holds all six as wildcards, but the spoke registry is a different account and
/// inherits none, so `addPool` reverts without these. The likeliest way for VIP-A to fail.
export const REGISTRY_GRANTS = REGISTRY_DRIVEN_ROLES;

/// The five spoke-only setters plus forced liquidation. Held by nobody on this chain, as a grant or a wildcard.
export const NORMAL_TIMELOCK_GRANTS = SPOKE_COMPTROLLER_ROLES;

/// Risk parameters. The chain does not check every incentive rule, so a Critical Guardian call keeps the same
/// rules a proposal does (shipment plan, Section 1.1).
export const CRITICAL_GUARDIAN_GRANTS = [
  SET_CLOSE_FACTOR,
  SET_LIQUIDATION_INCENTIVE,
  SET_MIN_LIQUIDATABLE_COLLATERAL,
  SET_MARKET_LIQUIDATION_INCENTIVE,
  SET_FORCED_LIQUIDATION,
];

/// Incident response. Its existing `setActionsPaused` wildcard already stops liquidations; these limit them
/// to chosen liquidators instead. Enabling the allowlist adds at least two liquidators in the same batch,
/// none of them borrowing in the pool.
///
/// No guardian gets `setSupplyAllowlistEnabled` or `setAllowedSupplier`: either lets someone other than a Hub
/// supply a liquidity market. In an incident the Pause Guardian pauses MINT instead.
export const PAUSE_GUARDIAN_GRANTS = [SET_LIQUIDATION_ALLOWLIST_ENABLED, SET_ALLOWED_LIQUIDATOR];

/// All 19, in proposal order. Each against `Comptroller_HubSpoke`, never address(0): a wildcard reaches every
/// contract that checks the same role string.
export const VIP_A_GRANTS: Grant[] = [
  ...REGISTRY_GRANTS.map(role => ({ role, account: SPOKE_POOL_REGISTRY })),
  ...NORMAL_TIMELOCK_GRANTS.map(role => ({ role, account: NORMAL_TIMELOCK })),
  ...CRITICAL_GUARDIAN_GRANTS.map(role => ({ role, account: CRITICAL_GUARDIAN })),
  ...PAUSE_GUARDIAN_GRANTS.map(role => ({ role, account: PAUSE_GUARDIAN })),
];

// ---------------------------------------------------------------------------------------------------
// VIP-A: the Risk Steward wildcards. Unlike the 19 above, these four are granted against address(0) on purpose.
//
// Each steward reads the market's comptroller and, for any comptroller other than the Core pool's, calls the
// isolated-pools setter below. A wildcard covers the spoke comptroller and every spoke market `028` deploys and VIP-C
// lists, and also every isolated-pools comptroller and vToken on this chain. The Normal and Fast-track timelocks
// already hold all four as wildcards and the Critical Guardian the first three; the stewards hold none (read with
// `isAllowedToCall` from an unrelated sender on 2026-10-14, block 127,593,829).
//
// The Core pool's cap and rate model setters check other strings (`_setMarketSupplyCaps`, `_setMarketBorrowCaps`,
// `_setInterestRateModel`), so three of the wildcards do not reach it. Its Core-only
// `setCollateralFactor(address,uint256,uint256)` checks the same string as the isolated pools, so the fourth does.
// The collateral factors steward never calls it: for the Core comptroller it calls the pool-id form VIP-592 granted.
// The steward proxies can only be upgraded by the Normal Timelock, through DEFAULT_PROXY_ADMIN.
// ---------------------------------------------------------------------------------------------------

/// The isolated-pools `VToken` rate model setter.
export const SET_INTEREST_RATE_MODEL = "setInterestRateModel(address)";

/// The ACM's any-contract key. Deliberate here; PENDING has the same value but means "not deployed yet".
export const ANY_CONTRACT = "0x0000000000000000000000000000000000000000";

/// One wildcard per role, in proposal order.
///
/// RATE MODELS: a spoke market, like every isolated-pools market, calls `getBorrowRate` with four arguments (bad debt
/// last), while a Core pool model takes three. A Core model set on a spoke market makes every later accrual revert,
/// `setInterestRateModel` included because it accrues first, so the market stays stuck until SpokeVTokenBeacon is
/// upgraded. The receiver never applies a rate model update directly: it waits out the timelock (6 hours today), and
/// only its whitelisted executors can then execute or reject it.
export const RISK_STEWARD_GRANTS: Grant[] = [
  { role: SET_COLLATERAL_FACTOR, account: COLLATERAL_FACTORS_RISK_STEWARD },
  { role: SET_MARKET_SUPPLY_CAPS, account: MARKET_CAPS_RISK_STEWARD },
  { role: SET_MARKET_BORROW_CAPS, account: MARKET_CAPS_RISK_STEWARD },
  { role: SET_INTEREST_RATE_MODEL, account: IRM_RISK_STEWARD },
];

// ---------------------------------------------------------------------------------------------------
// Wildcards VIP-A and VIP-C RELY ON but do not grant. A wildcard reaches a contract deployed after it was
// made, so these cover the new comptroller, registry and markets from their first block. Asserted BEFORE the
// proposal runs, so a revocation fails the simulation instead of the execution.
//
// Keyed by the contract the role is checked on, then by role, listing every account the VIP document's
// permission tables (§1.2 and §3.2) mark `wildcard`.
// ---------------------------------------------------------------------------------------------------

export const ASSUMED_WILDCARDS: Record<"comptroller" | "poolRegistry" | "vToken", Grant[]> = {
  comptroller: [
    ...[SET_CLOSE_FACTOR, SET_LIQUIDATION_INCENTIVE, SET_MIN_LIQUIDATABLE_COLLATERAL].map(role => ({
      role,
      account: NORMAL_TIMELOCK,
    })),
    ...[SET_COLLATERAL_FACTOR, SET_MARKET_SUPPLY_CAPS, SET_MARKET_BORROW_CAPS].flatMap(role =>
      [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, CRITICAL_GUARDIAN].map(account => ({ role, account })),
    ),
    // `PAUSE_ROLE` carries `uint256[]` while the call signature carries `uint8[]`, because `Action` is an enum.
    // The `uint256[]` form is the granted one; nobody holds `uint8[]`. Do not "fix" either.
    ...[PAUSE_ROLE, UNLIST_ROLE].flatMap(role =>
      [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK, PAUSE_GUARDIAN].map(account => ({ role, account })),
    ),
  ],

  /// Listing and naming are governance actions, the same as on the isolated-pools registry.
  poolRegistry: [
    "addPool(string,address,uint256,uint256,uint256)",
    "addMarket(AddMarketInput)",
    "setPoolName(address,string)",
    "updatePoolMetadata(address,VenusPoolMetaData)",
  ].map(role => ({ role, account: NORMAL_TIMELOCK })),

  /// Relied on by VIP-C, asserted here because the VIP document asks every proposal to pin them.
  vToken: [
    ...["setReduceReservesBlockDelta(uint256)", "setReserveFactor(uint256)", "setInterestRateModel(address)"].flatMap(
      role => [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK].map(account => ({ role, account })),
    ),
    { role: "setProtocolSeizeShare(uint256)", account: NORMAL_TIMELOCK },
  ],
};

/// Roles no account may hold as an address(0) wildcard before VIP-A, or a grant in VIP-A is a no-op and a
/// wildcard holder could already drive this pool. `enterMarketForAccount` is the critical one: its holder can
/// enter any account into any market and make that account's supply seizable collateral, and only
/// `CollateralGateway` may hold it (VIP-C). The `uint8[]` pause form is pinned so neither spelling gets "fixed".
export const MUST_NOT_BE_WILDCARD = [
  ...SPOKE_COMPTROLLER_ROLES,
  ...ROUTER_ROLES,
  "setActionsPaused(address[],uint8[],bool)",
];

// ===================================================================================================
// VIP-B: ACM grants on each Spoke source, and the Hub and yield-group roles it calls with.
//
// Read from the ACM on 2026-10-14 with `hasRole(keccak256(contract, role), account)` for the exact grant (block
// 127,532,699) and `hasRole` on the wildcard key for the wildcard (block 127,594,075), for the Normal, Fast-track and
// Critical timelocks, both guardians, the Oracle Guardian and the Operator, on all eleven live yield groups and all
// three Hubs. No account holds any of these roles as a wildcard. The mainnet ACM keys a wildcard on 32 zero bytes
// before the role, not a 20-byte address(0); `isAllowedToCall` from an unrelated sender agrees.
// ===================================================================================================

/// On all six live Core and Flux sources (the same generic `YieldGroup` as Spoke), the Normal Timelock holds all
/// eleven source roles, the Pause Guardian three and the Operator six; the Fast-track and Critical timelocks, the
/// Critical Guardian and the Oracle Guardian hold none. Each Spoke source gets the same.
export const SPOKE_SOURCE_NORMAL_TIMELOCK_GRANTS = SPOKE_SOURCE_ROLES;

/// Incident levers. The Pause Guardian also holds `pauseYieldGroup` on every Hub.
export const SPOKE_SOURCE_PAUSE_GUARDIAN_GRANTS = [UPDATE_RESOURCE_ADAPTER, PAUSE_RESOURCE, UNPAUSE_RESOURCE];

/// Routing inside the source. Not `addResource`, which stays with the Normal Timelock.
export const SPOKE_SOURCE_OPERATOR_GRANTS = [
  SET_INNER_DEPOSIT_QUEUE,
  SET_INNER_WITHDRAW_QUEUE,
  PAUSE_RESOURCE,
  UNPAUSE_RESOURCE,
  RAISE_RESOURCE_CAP,
  LOWER_RESOURCE_CAP,
];

/// The 20 grants on one Spoke source. VIP-B issues them on each of the three, 60 in all, never against address(0).
export const SPOKE_SOURCE_GRANTS: Grant[] = [
  ...SPOKE_SOURCE_NORMAL_TIMELOCK_GRANTS.map(role => ({ role, account: NORMAL_TIMELOCK })),
  ...SPOKE_SOURCE_PAUSE_GUARDIAN_GRANTS.map(role => ({ role, account: PAUSE_GUARDIAN })),
  ...SPOKE_SOURCE_OPERATOR_GRANTS.map(role => ({ role, account: OPERATOR })),
];

/// Roles VIP-B calls on existing contracts. The Normal Timelock holds each as an exact grant, not a wildcard.
export const HUB_ROLES_CALLED = ["addYieldGroup(address,uint256,uint16)", "setOuterWithdrawQueue(address[])"];
export const YIELD_GROUP_ROLES_CALLED = [UPDATE_RESOURCE_ADAPTER];

// ===================================================================================================
// VIP-C: the one grant, and the roles it calls on existing contracts.
//
// Read from the ACM on 2026-10-14 with `hasRole` for the exact grant (block ~127,552,000) and on the wildcard key
// above for the wildcard (block 127,594,075). The Normal Timelock holds every role below as an exact grant, none as
// a wildcard. VIP-C's comptroller, registry, market and Spoke source calls use VIP-A's and VIP-B's grants and the
// wildcards in ASSUMED_WILDCARDS.
// ===================================================================================================

/// `enterMarketForAccount(address,address)` on `Comptroller_HubSpoke`, to `CollateralGateway` only. The gateway passes
/// its own caller as the account; any other holder could enter any account into a market.
export const VIP_C_GRANTS: Grant[] = ROUTER_ROLES.map(role => ({ role, account: COLLATERAL_GATEWAY }));

/// The batch setters on Atlas, APRO, `ResilientOracle` and `BoundValidator` loop the single setter and check its role.
/// The DBO's batch setter checks a role of its own.
export const VIP_C_ROLES_CALLED: { contract: string; role: string }[] = [
  ...[ATLAS_ORACLE, APRO_ORACLE, RESILIENT_ORACLE].map(contract => ({ contract, role: "setTokenConfig(TokenConfig)" })),
  { contract: BOUND_VALIDATOR, role: "setValidateConfig(ValidateConfig)" },
  { contract: DEVIATION_BOUNDED_ORACLE, role: "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])" },
  ...HUB_STACKS.map(({ hub }) => ({ contract: hub, role: "setOuterDepositQueue(address[])" })),
];
