// ===================================================================================================
// VIP-671 — ACM role strings for the Hub-Funded Spoke pool (Phase 1).
//
// Every string is the literal argument passed to `_checkAccessAllowed(...)` in the contract, copied
// verbatim from isolated-pools/contracts/Spoke/SpokeComptroller.sol. The ACM hashes
// `keccak256(targetContract, roleString)`, so a string that merely looks right grants a role that
// nothing ever checks.
//
// ---------------------------------------------------------------------------------------------------
// HOW THE WILDCARD WORKS, AND WHY IT COVERS ONE SIDE BUT NOT THE OTHER
//
//   AccessControlManager.isAllowedToCall(account, sig) tries keccak256(msg.sender, sig) first and
//   falls back to keccak256(address(0), sig). So a grant made against address(0) is a WILDCARD over
//   every target contract, and a brand-new contract inherits it. The ACCOUNT in the grant is exact.
//
//   That asymmetry is the whole story here:
//     - The timelocks already hold wildcard grants for the shared Comptroller / VToken / PoolRegistry
//       roles, so those carry to the new comptroller and the new registry for free.
//     - The six setters PoolRegistry drives while registering a pool are wildcard-granted too, but to
//       the ISOLATED-POOLS registry address. The spoke pool has a registry of its own, which is a
//       different account, so it inherits nothing and `addPool` reverts without the grants below.
//
// ---------------------------------------------------------------------------------------------------
// VERIFIED ON CHAIN (bsctestnet, ACM 0x45f8…a9AA), by reading
// `hasRole(keccak256(address(0), sig), account)`:
//
//   ALREADY COVERED, so this VIP does NOT re-grant them. That list is `ASSUMED_WILDCARD_ROLES` and
//   `ASSUMED_GUARDIAN_ROLES` at the bottom of this file, deliberately as code rather than as prose: a
//   comment claiming a permission exists is exactly the assumption that turns into a failed execution,
//   so every entry is asserted BEFORE the VIP runs in simulations/vip-671/bsctestnet.ts. A revocation
//   between now and the proposal then fails the simulation instead of the proposal.
//
//   NOT COVERED for any timelock, for the Guardian, or for anyone else, and therefore granted by this
//   VIP: `REGISTRY_DRIVEN_ROLES` and `SPOKE_COMPTROLLER_ROLES`. Verified false for the Guardian too.
//
// ---------------------------------------------------------------------------------------------------
// GRANTEES: THE NORMAL TIMELOCK AND THE GUARDIAN.
//
//   Both receive the same six roles. The Fast-track and Critical timelocks receive nothing.
//
//   WHY THE GUARDIAN, AND WHY ONLY HERE. This pool exists on bsctestnet to be tested, and every one of
//   these six roles is a knob QA has to turn in both directions to exercise it at all: add and remove a
//   test supplier, arm and lift either allowlist, and switch forced liquidation on to produce a
//   liquidatable position without waiting for a real depeg. Leaving them on the Normal Timelock alone
//   means a governance proposal per test case, which is not a control, just a delay. The Guardian is
//   the multisig that already carries the day-to-day testnet knobs on this chain.
//
//   This is a TESTNET decision. A mainnet spoke pool should grant these to the Normal Timelock alone;
//   do not copy this block into a mainnet listing.
//
//   It is also a narrower change than it looks. The Guardian already holds `setCollateralFactor`,
//   `setMarketSupplyCaps` and `setMarketBorrowCaps` as wildcards on this chain, and those are the
//   parameters that decide when a position is underwater, so it can already put an account into
//   shortfall on any pool. What it gains here is who may supply and who may liquidate on ONE testnet
//   pool, not a class of control it did not have.
//
//   One thing this does NOT change: all three timelocks can already call
//   `setActionsPaused(address[],uint256[],bool)` through a pre-existing wildcard that reaches any new
//   comptroller, so the emergency pause path on this pool is open from the first block. The Guardian
//   does NOT hold that wildcard (verified false) and this VIP does not add it.
//
// NOTE on setActionsPaused. The role string is `setActionsPaused(address[],uint256[],bool)` while the
// CALL signature is `setActionsPaused(address[],uint8[],bool)`, because `Action` is an enum. They are
// different strings on purpose. Confirmed on chain: the `uint256[]` form is granted to all three
// timelocks and the `uint8[]` form is granted to none, so the `uint256[]` form is the live one. Do
// not "fix" either to match the other.
// (isolated-pools/tests/hardhat/Fork/HubSpoke/fixture.ts SPOKE_ROLES has the `uint8[]` form, which
// grants a role nothing checks. Reported upstream; it does not affect this VIP.)
// ===================================================================================================

/**
 * The five role strings that exist only on `SpokeComptroller`. No other Venus contract checks a string
 * with these names, so no pre-existing wildcard can cover them. A pool listed without these is listed
 * with its allowlists and its per-market liquidation incentives permanently unreachable.
 */
export const SPOKE_ONLY_ROLES = [
  "setMarketLiquidationIncentive(address,uint256)",
  "setSupplyAllowlistEnabled(address,bool)",
  "setAllowedSupplier(address,address,bool)",
  "setLiquidationAllowlistEnabled(bool)",
  "setAllowedLiquidator(address,bool)",
];

/**
 * Shared with the pooled `Comptroller`, but NOT wildcard-granted on bsctestnet — verified false for all
 * three timelocks and for the Guardian. It is granted per pool. Included because it is the only lever
 * that makes a stablecoin position liquidatable on demand, which is how the liquidation path gets
 * tested here without waiting for a real depeg.
 */
export const SPOKE_EXTRA_ROLES = ["setForcedLiquidation(address,bool)"];

export const SPOKE_COMPTROLLER_ROLES = [...SPOKE_ONLY_ROLES, ...SPOKE_EXTRA_ROLES];

/**
 * The six setters `PoolRegistry` calls into the comptroller as `msg.sender` while running `addPool`
 * and `addMarket`. Granted to the SPOKE registry, not to a timelock.
 *
 * Verified on chain: the isolated-pools registry holds all six as wildcards and the spoke registry
 * holds none, so `addPool` reverts on execution without these. This is the single most likely way for
 * this VIP to fail, because the wildcards make it look covered until you check the account.
 */
export const REGISTRY_DRIVEN_ROLES = [
  "setCloseFactor(uint256)",
  "setLiquidationIncentive(uint256)",
  "setMinLiquidatableCollateral(uint256)",
  "setCollateralFactor(address,uint256,uint256)",
  "setMarketSupplyCaps(address[],uint256[])",
  "setMarketBorrowCaps(address[],uint256[])",
];

/**
 * TODO(deploy): `enterMarketBehalf(address,address)` lets an approved router enter a market for the
 * supplier it is minting on behalf of, so a first-time supplier needs one transaction instead of two.
 * It is NOT granted here. The contract's own guidance is to grant it only to a router that passes its
 * own caller through as `account`, and no such router is deployed on this chain. Granting it to a
 * timelock would be meaningless and would widen the surface for nothing. Add the grant in the VIP that
 * ships the router.
 */
export const ROUTER_ROLES = ["enterMarketBehalf(address,address)"];

/**
 * The permissions this VIP RELIES ON but does not grant, because bsctestnet already holds them as
 * address(0) wildcards and a wildcard reaches a contract deployed after it was made. Keyed by the
 * contract the role is checked on, since the ACM hashes the target into the role.
 *
 * Every string is copied from the source that checks it, including the two that carry a struct or enum
 * name rather than the expanded tuple, which is where this kind of list usually goes wrong:
 *   PoolRegistry.sol:162        addMarket(AddMarketInput)
 *   PoolRegistry.sol:226        updatePoolMetadata(address,VenusPoolMetaData)
 *   ProtocolShareReserve.sol:235 addOrUpdateDistributionConfigs(DistributionConfig[])
 *   ProtocolShareReserve.sol:283 removeDistributionConfig(Schema,address)
 * The DeviationBoundedOracle goes the other way and uses the expanded tuple
 * (DeviationBoundedOracle.sol:302).
 *
 * Asserted pre-VIP in simulations/vip-671/bsctestnet.ts, for the accounts named against each group.
 */
export const ASSUMED_WILDCARD_ROLES = {
  /// Held by the Normal Timelock. The first six are the same strings the spoke registry is granted in
  /// this VIP: the wildcard covers the timelock as an account, it does not cover the registry.
  comptroller: [
    "setCloseFactor(uint256)",
    "setLiquidationIncentive(uint256)",
    "setMinLiquidatableCollateral(uint256)",
    "setCollateralFactor(address,uint256,uint256)",
    "setMarketSupplyCaps(address[],uint256[])",
    "setMarketBorrowCaps(address[],uint256[])",
    "unlistMarket(address)",
  ],

  /// Held by the Normal Timelock, on each spoke vToken. The VIP calls the first two directly.
  vToken: [
    "setReduceReservesBlockDelta(uint256)",
    "setReserveFactor(uint256)",
    "setInterestRateModel(address)",
    "setProtocolSeizeShare(uint256)",
  ],

  /// Held by the Normal Timelock, on the SPOKE registry. The VIP calls the first two directly, and
  /// they are the reason a brand-new registry needs no grant of its own for the timelock to drive it.
  poolRegistry: [
    "addPool(string,address,uint256,uint256,uint256)",
    "addMarket(AddMarketInput)",
    "setPoolName(address,string)",
    "updatePoolMetadata(address,VenusPoolMetaData)",
  ],

  /// Held by all three timelocks. The VIP calls this on the collateral underlying.
  deviationBoundedOracle: ["setTokenConfig((address,uint64,uint256,uint256,bool,bool))"],

  /// Held by all three timelocks. The VIP calls both.
  protocolShareReserve: [
    "addOrUpdateDistributionConfigs(DistributionConfig[])",
    "removeDistributionConfig(Schema,address)",
  ],

  /// Held by all three timelocks, on the comptroller. Not called by this VIP: asserted because the
  /// decision to grant nothing to the Fast-track and Critical timelocks rests on the pause path
  /// already reaching this pool without them.
  pause: ["setActionsPaused(address[],uint256[],bool)"],
};

/**
 * Held by the Guardian on the comptroller as wildcards, before this VIP. Asserted because the case for
 * the Guardian grants above rests on it: these are the parameters that decide when an account is in
 * shortfall, so the Guardian can already put a position underwater on any pool on this chain.
 */
export const ASSUMED_GUARDIAN_ROLES = [
  "setCollateralFactor(address,uint256,uint256)",
  "setMarketSupplyCaps(address[],uint256[])",
  "setMarketBorrowCaps(address[],uint256[])",
];

/// ACM `giveCallPermission` command builder.
export const giveCallPermission = (acm: string, contract: string, signature: string, account: string) => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, signature, account],
});
