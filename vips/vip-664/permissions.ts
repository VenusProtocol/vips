// ===================================================================================================
// VIP-664 — Centrifuge YieldGroup ACM role-string sets.
//
// Every string is the literal signature passed to `_checkAccessAllowed(...)` (or, for the guards,
// `_requireGuardConfig(...)`) in the deployed contracts, copied verbatim — the ACM role is
// `keccak256(targetContract, roleString)`, so a string that merely looks right grants a role nothing
// checks.
//
// Source of truth:
//   YieldGroup/base/YieldGroupBase.sol -> the 8 shared gated functions, identical to VIP-650's
//                                         YIELD_GROUP_BASE. Repeated here rather than imported so
//                                         this VIP stays readable on its own.
//   YieldGroup/YieldGroupCentrifuge.sol -> the async surface, the price-age guard, forceRemoveResource
//   YieldGroup/base/PriceGuards.sol     -> the growth and drop guard setters
//
// `enforceDropGuard(address)` is deliberately absent: it is permissionless by design, so monitoring
// can trip the breaker without holding a role.
// ===================================================================================================

// Shared YieldGroupBase surface (same 8 strings VIP-650 uses).
export const YIELD_GROUP_BASE = [
  "addResource(address,address)",
  "removeResource(address)",
  "updateResourceAdapter(address,address)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
  "sweep(address,address)",
];

// Async lifecycle: opening a redemption and cancelling either direction. Wind-down actions, so the
// Operator holds them as well as Governance.
export const CENTRIFUGE_ASYNC_REQUESTS = [
  "requestRedeem(address,uint256)",
  "cancelDepositRequest(address)",
  "cancelRedeemRequest(address)",
];

// Claims. Idempotent collection of settled buckets — the Keeper's whole job, and nothing else's.
export const CENTRIFUGE_CLAIMS = [
  "claimDeposit(address)",
  "claimRedeem(address)",
  "claimCancelDeposit(address)",
  "claimCancelRedeem(address)",
];

// The three price defences. All opt-in per resource and all governance-only: each is a decision about
// how the position may be marked, and an over-tight value is a self-inflicted halt.
export const CENTRIFUGE_PRICE_GUARDS = [
  "setPriceAgeGuard(address,address,uint64,uint64)",
  "disablePriceAgeGuard(address)",
  "setGrowthGuardRate(address,uint16,uint16,uint32)",
  "setGrowthGuardSnapshot(address,uint128,uint64)",
  "setDropGuardRate(address,uint16,uint16,uint32)",
  "setDropGuardSnapshot(address,uint128,uint64)",
];

// `YieldGroupCentrifuge` has no per-resource cap and no setBlocksPerYear, so it must not reuse
// CORE_FLUX_GOVERNANCE. It does add forceRemoveResource, like FRV.
export const CENTRIFUGE_GOVERNANCE = [
  ...YIELD_GROUP_BASE,
  "forceRemoveResource(address)",
  ...CENTRIFUGE_ASYNC_REQUESTS,
  ...CENTRIFUGE_CLAIMS,
  ...CENTRIFUGE_PRICE_GUARDS,
];

// Queue control, pause-down, and the async wind-down surface. No unpause, no add/remove, no sweep,
// no guard configuration, no claims.
export const CENTRIFUGE_OPERATOR = [
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  ...CENTRIFUGE_ASYNC_REQUESTS,
];

// The routine keeper: the four claim entry points, nothing else.
export const CENTRIFUGE_KEEPER = [...CENTRIFUGE_CLAIMS];

// Containment only, mirroring FRV_GUARDIAN: pause a resource, and evict a bricked vault.
export const CENTRIFUGE_GUARDIAN = ["pauseResource(address)", "forceRemoveResource(address)"];

// ---------------------------------------------------------------------------------------------------
// Granted on the HUB, to the SOURCE contract itself — not to a human role.
//
// `YieldGroupCentrifuge._onDropBreach` calls `IHub(hub).pauseHub()` with no try/catch, so without this
// a genuine breach makes the permissionless `enforceDropGuard` REVERT rather than pause: the circuit
// breaker is dead, not degraded. Easy to overlook because `pauseHub()` is already granted to
// Governance and the Guardian; this is a separate grant, to a contract.
// ---------------------------------------------------------------------------------------------------
export const PAUSE_HUB = "pauseHub()";

export const giveCallPermission = (acm: string, contract: string, sig: string, account: string) => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});
