// ===================================================================================================
// VIP-650 / VIP-651 — Liquidity Hub ACM role-string sets, shared by the mainnet and testnet proposals.
//
// Every string is the literal signature passed to `_checkAccessAllowed(...)` in the deployed
// contracts, copied verbatim — the ACM role is `keccak256(targetContract, roleString)`, so a string
// that merely looks right grants a role nothing checks.
//
// Source of truth per contract:
//   Hub/Hub.sol                     -> HUB_*             (19 gated fns: 18 governance + reallocate)
//   YieldGroup/base/YieldGroupBase  -> YIELD_GROUP_BASE  (8 shared gated fns)
//   YieldGroup/YieldGroup.sol       -> CORE_FLUX_*       (base + resource caps + setBlocksPerYear)
//   YieldGroup/YieldGroupFRV.sol    -> FRV_*             (base + forceRemoveResource; no caps)
//   registry/HubRegistry.sol        -> HUB_REGISTRY_*    (addHub / removeHub)
//
// The holder split departs from the shipment plan's tables in two places, both resolved against the
// contracts:
//   - the Guardian also holds `pauseHub()`, per Hub.sol's "(Operator, Guardian, or VIP)" and the
//     protocol README; only the plan's table leaves that cell blank.
//   - Governance is NOT granted `reallocate`, which the plan's table marks yes. Its own prose says
//     otherwise, and Governance holds `emergencyReallocate`, which also works while paused.
// ===================================================================================================

// Operator-only: net-zero rebalance, callable only while unpaused.
export const REALLOCATE = "reallocate((address,address,uint256)[],(address,address,uint256)[])";

// ---------------------------------------------------------------------------------------------------
// Hub. Identical for every asset stack — the ACM binds a role per contract address.
// ---------------------------------------------------------------------------------------------------

// Every gated Hub function except `reallocate`.
export const HUB_GOVERNANCE = [
  "addYieldGroup(address,uint256,uint16)",
  "removeYieldGroup(address)",
  "raiseYieldGroupCap(address,uint256,uint16)",
  "lowerYieldGroupCap(address,uint256,uint16)",
  "setOuterDepositQueue(address[])",
  "setOuterWithdrawQueue(address[])",
  "emergencyReallocate((address,address,uint256)[],(address,address,uint256)[])",
  "pauseHub()",
  "unpauseHub()",
  "pauseYieldGroup(address)",
  "unpauseYieldGroup(address)",
  "raiseMaxWithdrawalSize(uint256)",
  "lowerMaxWithdrawalSize(uint256)",
  "setManagementFeeBps(uint16)",
  "setPerformanceFeeBps(uint16)",
  "setRedeemFeeBps(uint16)",
  "setFeeRecipient(address)",
  "sweep(address,address)",
];

// The routine keeper. `raiseYieldGroupCap` is included so it can open headroom before a `reallocate`
// without a governance round; it gets no unpause, no fees, no add/remove and no `sweep`.
export const HUB_OPERATOR = [
  "raiseYieldGroupCap(address,uint256,uint16)",
  "lowerYieldGroupCap(address,uint256,uint16)",
  "setOuterDepositQueue(address[])",
  "setOuterWithdrawQueue(address[])",
  REALLOCATE,
  "pauseHub()",
  "pauseYieldGroup(address)",
  "lowerMaxWithdrawalSize(uint256)",
];

// Governance plus `reallocate`, the only operator signature not already in HUB_GOVERNANCE.
// Testnet Guardian proposal only.
export const HUB_FULL = [...HUB_GOVERNANCE, REALLOCATE];

// ---------------------------------------------------------------------------------------------------
// Yield sources. All three share the YieldGroupBase surface; each subclass adds to it.
// ---------------------------------------------------------------------------------------------------

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

// Core and Flux are `YieldGroup`.
export const CORE_FLUX_GOVERNANCE = [
  ...YIELD_GROUP_BASE,
  "raiseResourceCap(address,uint256)",
  "lowerResourceCap(address,uint256)",
  "setBlocksPerYear(uint256)",
];

// FRV is `YieldGroupFRV`: no cap setters, no setBlocksPerYear, so it must not reuse the set above.
export const FRV_GOVERNANCE = [...YIELD_GROUP_BASE, "forceRemoveResource(address)"];

// FRV has no per-resource cap, so its operator set is the queue + pause subset.
export const CORE_FLUX_OPERATOR = [
  "raiseResourceCap(address,uint256)",
  "lowerResourceCap(address,uint256)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
];
export const FRV_OPERATOR = [
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
];

// ---------------------------------------------------------------------------------------------------
// Guardian sets (mainnet). The Guardian multisig acts with no timelock delay, so it holds containment
// only: pause at every level, `emergencyReallocate` (the sole fund-mover that works while paused), and
// `forceRemoveResource` to evict a bricked FRV vault. No unpause, so it can contain but never undo a
// governance-ordered pause. Every string here is a strict subset of the Governance set above.
// ---------------------------------------------------------------------------------------------------
export const HUB_GUARDIAN = [
  "pauseHub()",
  "pauseYieldGroup(address)",
  "emergencyReallocate((address,address,uint256)[],(address,address,uint256)[])",
];

export const CORE_FLUX_GUARDIAN = ["pauseResource(address)"];

export const FRV_GUARDIAN = ["pauseResource(address)", "forceRemoveResource(address)"];

// ---------------------------------------------------------------------------------------------------
// HubRegistry — the only two gated functions.
// ---------------------------------------------------------------------------------------------------
// Broken out because part 2 re-grants exactly this role and nothing else on the registry.
export const ADD_HUB = "addHub(address)";

export const HUB_REGISTRY_GOVERNANCE = [ADD_HUB, "removeHub(address)"];

// `acm` is a parameter so this module stays network-agnostic; each network's VIP supplies its own.
export const giveCallPermission = (acm: string, contract: string, sig: string, account: string) => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

// bsctestnet-guardian.ts grants the Guardian HUB_FULL plus the full Governance set on every source.
// That is a testnet convenience for fast iteration and is deliberately not mirrored to mainnet, which
// uses the *_GUARDIAN subsets above.
