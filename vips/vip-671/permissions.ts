// ===================================================================================================
// VIP-671 — ACM role strings for the Hub-Funded Spoke pool.
//
// Every string is the literal argument passed to `_checkAccessAllowed(...)` in the deployed contract,
// copied verbatim. The ACM hashes `keccak256(targetContract, roleString)`, so a string that merely
// looks right grants a role nothing ever checks.
//
// Source of truth per contract:
//   isolated-pools/contracts/Spoke/SpokeComptroller.sol   -> SPOKE_*
//   venus-liquidity-hub/contracts/YieldGroup/YieldGroup.sol
//     + YieldGroup/base/YieldGroupBase.sol                -> SPOKE_SOURCE_GOVERNANCE
//
// WHAT IS ALREADY COVERED ON bsctestnet (checked on chain, ACM 0x45f8…a9AA):
//
//   The Normal Timelock holds WILDCARD grants (role keyed on address(0), so a brand-new comptroller
//   inherits them) for every pooled-Comptroller role the listing needs:
//     setCloseFactor(uint256), setLiquidationIncentive(uint256), setMinLiquidatableCollateral(uint256),
//     setCollateralFactor(address,uint256,uint256), setMarketSupplyCaps(address[],uint256[]),
//     setMarketBorrowCaps(address[],uint256[]), setActionsPaused(address[],uint256[],bool),
//     unlistMarket(address), plus the VToken roles setReserveFactor(uint256),
//     setProtocolSeizeShare(uint256), setReduceReservesBlockDelta(uint256),
//     setInterestRateModel(address), and the PoolRegistry roles
//     addPool(string,address,uint256,uint256,uint256) and addMarket(AddMarketInput).
//
//   PoolRegistry itself holds wildcard grants for the six setters it drives inside addPool/addMarket,
//   so registration needs no extra grant for it either.
//
//   Hub_USDT already grants the Normal Timelock addYieldGroup / setOuterDepositQueue /
//   setOuterWithdrawQueue (and the cap and removal roles), so the Hub leg needs no new Hub-level grant.
//
// WHAT IS NOT COVERED, and therefore has to be granted by this VIP: everything in this file.
//
// NOTE on setActionsPaused: the ACM role string is `setActionsPaused(address[],uint256[],bool)` (the
// pooled Comptroller passes the `uint256[]` form to _checkAccessAllowed), while the CALL signature is
// `setActionsPaused(address[],uint8[],bool)` because `Action` is an enum. They are different strings
// on purpose; do not "fix" one to match the other.
// ===================================================================================================

/**
 * The five role strings that exist only on `SpokeComptroller`. No other Venus contract checks a string
 * with these names, so no pre-existing wildcard can cover them — verified false on bsctestnet for the
 * Normal Timelock. A pool listed without these is listed with its allowlists and its per-market
 * liquidation incentives permanently unreachable.
 */
export const SPOKE_ONLY_ROLES = [
  "setMarketLiquidationIncentive(address,uint256)",
  "setSupplyAllowlistEnabled(address,bool)",
  "setAllowedSupplier(address,address,bool)",
  "setLiquidationAllowlistEnabled(bool)",
  "setAllowedLiquidator(address,bool)",
];

/**
 * Shared with the pooled `Comptroller`, but NOT wildcard-granted on bsctestnet (checked: false for all
 * three timelocks). It is granted per pool — Comptroller_Stablecoins has it, Comptroller_BTC does not.
 * Included so governance can enable forced liquidation on a spoke market without a follow-up VIP.
 */
export const SPOKE_EXTRA_ROLES = ["setForcedLiquidation(address,bool)"];

export const SPOKE_COMPTROLLER_ROLES = [...SPOKE_ONLY_ROLES, ...SPOKE_EXTRA_ROLES];

/**
 * The governance surface of a `YieldGroup` (the Spoke source is the generic YieldGroup, same contract
 * the Core and Flux families run, behind its own beacon). Identical to VIP-650's CORE_FLUX_GOVERNANCE
 * set, because the Spoke source is that same implementation.
 *
 * `addResource`, `setInnerDepositQueue` and `setInnerWithdrawQueue` are used by this very VIP, so these
 * grants must be ordered BEFORE the wiring commands in the proposal.
 */
export const SPOKE_SOURCE_GOVERNANCE = [
  "addResource(address,address)",
  "removeResource(address)",
  "updateResourceAdapter(address,address)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
  "sweep(address,address)",
  "raiseResourceCap(address,uint256)",
  "lowerResourceCap(address,uint256)",
  "setBlocksPerYear(uint256)",
];

/// ACM `giveCallPermission` command builder.
export const giveCallPermission = (acm: string, contract: string, signature: string, account: string) => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, signature, account],
});
