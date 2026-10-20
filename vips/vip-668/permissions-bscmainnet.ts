import {
  PAUSE_ROLE,
  REGISTRY_DRIVEN_ROLES,
  ROUTER_ROLES,
  SET_ALLOWED_LIQUIDATOR,
  SET_CLOSE_FACTOR,
  SET_COLLATERAL_FACTOR,
  SET_FORCED_LIQUIDATION,
  SET_LIQUIDATION_ALLOWLIST_ENABLED,
  SET_LIQUIDATION_INCENTIVE,
  SET_MARKET_BORROW_CAPS,
  SET_MARKET_LIQUIDATION_INCENTIVE,
  SET_MARKET_SUPPLY_CAPS,
  SET_MIN_LIQUIDATABLE_COLLATERAL,
  SPOKE_COMPTROLLER_ROLES,
  UNLIST_ROLE,
} from "../vip-668/permissions";
import {
  COLLATERAL_FACTORS_RISK_STEWARD,
  CRITICAL_GUARDIAN,
  FAST_TRACK_TIMELOCK,
  IRM_RISK_STEWARD,
  MARKET_CAPS_RISK_STEWARD,
  NORMAL_TIMELOCK,
  PAUSE_GUARDIAN,
  SPOKE_POOL_REGISTRY,
} from "./addresses/bscmainnet";

// ===================================================================================================
// VIP-668 [BNB Chain]: ACM grants (19 on `Comptroller_HubSpoke`, and four Risk Steward wildcards), and what
// it relies on. VIP-669's and VIP-670's live in ../vip-669 and ../vip-670.
//
// Every string is the literal the checking contract (`SpokeComptroller`, `PoolRegistry`, `VToken`, `YieldGroup`,
// `Hub`) passes to `_checkAccessAllowed`, imported from ./permissions.ts where it is shared.
//
// VIP-668's: read from the ACM 0x4788…3555 on 2026-10-13 (block 127,396,467) with `isAllowedToCall(account, role)`
// called from an UNRELATED `msg.sender`, so a `true` proves an address(0) wildcard rather than a grant against
// one contract. The mainnet ACM does not expose `hasPermission`.
// ===================================================================================================

export type Grant = { role: string; account: string };

/// The six setters `PoolRegistry` drives on the comptroller as `msg.sender` during `addPool` and `addMarket`.
/// The isolated-pools registry holds all six as wildcards, but the spoke registry is a different account and
/// inherits none, so `addPool` reverts without these. The likeliest way for VIP-668 to fail.
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
export const VIP_668_GRANTS: Grant[] = [
  ...REGISTRY_GRANTS.map(role => ({ role, account: SPOKE_POOL_REGISTRY })),
  ...NORMAL_TIMELOCK_GRANTS.map(role => ({ role, account: NORMAL_TIMELOCK })),
  ...CRITICAL_GUARDIAN_GRANTS.map(role => ({ role, account: CRITICAL_GUARDIAN })),
  ...PAUSE_GUARDIAN_GRANTS.map(role => ({ role, account: PAUSE_GUARDIAN })),
];

// ---------------------------------------------------------------------------------------------------
// VIP-668: the Risk Steward wildcards. Unlike the 19 above, these four are granted against address(0) on purpose.
//
// Each steward reads the market's comptroller and, for any comptroller other than the Core pool's, calls the
// isolated-pools setter below. A wildcard covers the spoke comptroller and every spoke market `028` deploys and VIP-670
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
// Wildcards VIP-668 and VIP-670 RELY ON but do not grant. A wildcard reaches a contract deployed after it was
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

  /// Relied on by VIP-670, asserted here because the VIP document asks every proposal to pin them.
  vToken: [
    ...["setReduceReservesBlockDelta(uint256)", "setReserveFactor(uint256)", "setInterestRateModel(address)"].flatMap(
      role => [NORMAL_TIMELOCK, FAST_TRACK_TIMELOCK].map(account => ({ role, account })),
    ),
    { role: "setProtocolSeizeShare(uint256)", account: NORMAL_TIMELOCK },
  ],
};

/// Roles no account may hold as an address(0) wildcard before VIP-668, or a grant in VIP-668 is a no-op and a
/// wildcard holder could already drive this pool. `enterMarketForAccount` is the critical one: its holder can
/// enter any account into any market and make that account's supply seizable collateral, and only
/// `CollateralGateway` may hold it (VIP-670). The `uint8[]` pause form is pinned so neither spelling gets "fixed".
export const MUST_NOT_BE_WILDCARD = [
  ...SPOKE_COMPTROLLER_ROLES,
  ...ROUTER_ROLES,
  "setActionsPaused(address[],uint8[],bool)",
];
