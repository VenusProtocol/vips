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
// VERIFIED ON CHAIN (bsctestnet, ACM 0x45f8…a9AA, block 129,788,112), by reading
// `hasRole(keccak256(address(0), sig), account)` for each timelock:
//
//   ALREADY COVERED for the Normal Timelock, so this VIP does NOT re-grant them:
//     Comptroller  : setCloseFactor, setLiquidationIncentive, setMinLiquidatableCollateral,
//                    setCollateralFactor, setMarketSupplyCaps, setMarketBorrowCaps,
//                    setActionsPaused(address[],uint256[],bool), unlistMarket
//     VToken       : setReserveFactor, setInterestRateModel, setReduceReservesBlockDelta,
//                    setProtocolSeizeShare
//     PoolRegistry : addPool, addMarket, setPoolName, updatePoolMetadata
//                    (wildcards, so they reach the NEW spoke registry with no extra grant. The
//                    Fast-track and Critical timelocks hold none of these four, on the spoke registry
//                    or the isolated one, so this VIP does not add them and keeps the two registries
//                    on the same footing.)
//
//   NOT COVERED for any timelock, and therefore granted by this VIP: everything below.
//
// ---------------------------------------------------------------------------------------------------
// GRANTEES: THE NORMAL TIMELOCK ONLY.
//
//   The Fast-track and Critical timelocks receive nothing from this VIP, and neither does the
//   Guardian. A grant is cheap to add later and awkward to take back, so the emergency timelocks stay
//   off a pool that has not run yet.
//
//   Two things this does NOT change, both pre-existing wildcards that already reach any new
//   comptroller and that this VIP leaves alone:
//     - all three timelocks can already call `setActionsPaused(address[],uint256[],bool)`, so the
//       emergency pause path on this pool is open from the first block;
//     - the Guardian can already call `setMarketSupplyCaps`, `setMarketBorrowCaps` and
//       `setCollateralFactor`. It holds no per-pool grant on any existing bsctestnet isolated pool
//       either (checked against Comptroller_DeFi, _StableCoins and _GameFi), so this pool matches
//       what the chain already does rather than inventing a new arrangement.
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
 * Shared with the pooled `Comptroller`, but NOT wildcard-granted on bsctestnet — verified false for
 * all three timelocks. It is granted per pool. Included so governance can enable forced liquidation on
 * a spoke market without a follow-up VIP.
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

/// ACM `giveCallPermission` command builder.
export const giveCallPermission = (acm: string, contract: string, signature: string, account: string) => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, signature, account],
});
