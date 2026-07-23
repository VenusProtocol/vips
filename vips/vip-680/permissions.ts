// ===================================================================================================
// VIP-680 — Liquidity Hub (USDT) ACM role-string sets.
//
// Every string is the literal function signature passed to `_checkAccessAllowed(...)` in the deployed
// contracts (the ACM role is `keccak256(targetContract, roleString)`), copied verbatim from
// venus-liquidity-hub/contracts. The asymmetric model (README "Permissions"): Governance may loosen
// AND tighten; the Operator may only tighten (lower caps, pause, reorder queues) plus `reallocate`.
//
// Source of truth per contract:
//   Hub/Hub.sol                     -> HUB_*        (19 gated fns: 18 governance + operator-only reallocate)
//   YieldGroup/base/YieldGroupBase  -> YIELD_GROUP_BASE (8 shared gated fns)
//   YieldGroup/YieldGroup.sol       -> CORE_FLUX_*  (base + resource caps + setBlocksPerYear)
//   YieldGroup/YieldGroupFRV.sol    -> FRV_*        (base + forceRemoveResource; NO caps, NO blocksPerYear)
//   registry/HubRegistry.sol        -> HUB_REGISTRY (addHub / removeHub)
// ===================================================================================================

// Operator-only on the Hub: net-zero rebalance, callable only while unpaused. NOT in the Governance
// set (governance holds the pause-bypassing `emergencyReallocate` instead).
export const REALLOCATE = "reallocate((address,address,uint256)[],(address,address,uint256)[])";

// ---------------------------------------------------------------------------------------------------
// Hub_USDT.
// ---------------------------------------------------------------------------------------------------

// Governance role set: every gated Hub function EXCEPT `reallocate` (operator-only).
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

// Operator role set: tighten-only + `reallocate` + emergency pause.
export const HUB_OPERATOR = [
  "lowerYieldGroupCap(address,uint256,uint16)",
  "setOuterDepositQueue(address[])",
  "setOuterWithdrawQueue(address[])",
  REALLOCATE,
  "pauseHub()",
  "pauseYieldGroup(address)",
  "lowerMaxWithdrawalSize(uint256)",
];

// Full control on the Hub = Governance ∪ {reallocate}, deduped (reallocate is the only operator sig
// not already in HUB_GOVERNANCE). Used only by the testnet Guardian proposal.
export const HUB_FULL = [...HUB_GOVERNANCE, REALLOCATE];

// ---------------------------------------------------------------------------------------------------
// Yield sources (Core / FRV / Flux). All three share the YieldGroupBase surface; each subclass adds
// a few functions.
// ---------------------------------------------------------------------------------------------------

// Shared by all three sources.
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

// Core & Flux use `YieldGroup`: base + per-resource caps + blocksPerYear.
export const CORE_FLUX_GOVERNANCE = [
  ...YIELD_GROUP_BASE,
  "raiseResourceCap(address,uint256)",
  "lowerResourceCap(address,uint256)",
  "setBlocksPerYear(uint256)",
];

// FRV uses `YieldGroupFRV`: base + forceRemoveResource. It has NO cap setters and NO setBlocksPerYear,
// so it must not reuse CORE_FLUX_GOVERNANCE.
export const FRV_GOVERNANCE = [...YIELD_GROUP_BASE, "forceRemoveResource(address)"];

// Operator (tighten-only) sets. Core/Flux can lower per-resource caps; FRV has no cap to lower.
export const CORE_FLUX_OPERATOR = [
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "lowerResourceCap(address,uint256)",
];
export const FRV_OPERATOR = [
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
];

// ---------------------------------------------------------------------------------------------------
// Fast-Track sets (mainnet). A middle tier between Governance and Operator: every risk/ops lever, in
// BOTH directions (raise and lower, pause and unpause), but nothing that changes the shape of the
// stack. Withheld from the fast lane and reserved to the Normal Timelock: add/remove YieldGroup,
// add/remove/forceRemove Resource, updateResourceAdapter, the four fee setters, sweep,
// setBlocksPerYear, and the registry entirely.
//
// `updateResourceAdapter` repoints a resource's delegatecall target and is the highest-risk function
// in the stack — it stays governance-only. This mirrors the mainnet convention in VIP-627, which kept
// setOracle / setComptroller / setLiquidationAdapter off the fast lane while granting it the risk
// parameters, and VIP-258, which gave the fast lanes both the pause AND the resume side of each
// reversible lever.
// ---------------------------------------------------------------------------------------------------

// `emergencyReallocate` is the only fund-mover here. It is included because it is the sole route that
// still works while the Hub is paused (the Operator's `reallocate` reverts once paused), so without it
// recovering a paused Hub needs a full 48h Normal proposal. It is net-zero and confined to registered
// routes, so it cannot move value out of the Hub.
export const HUB_FAST_TRACK = [
  "raiseYieldGroupCap(address,uint256,uint16)",
  "lowerYieldGroupCap(address,uint256,uint16)",
  "raiseMaxWithdrawalSize(uint256)",
  "lowerMaxWithdrawalSize(uint256)",
  "setOuterDepositQueue(address[])",
  "setOuterWithdrawQueue(address[])",
  "pauseHub()",
  "unpauseHub()",
  "pauseYieldGroup(address)",
  "unpauseYieldGroup(address)",
  "emergencyReallocate((address,address,uint256)[],(address,address,uint256)[])",
];

// Core & Flux: the per-resource cap in both directions, inner queues, and resource pause/unpause.
export const CORE_FLUX_FAST_TRACK = [
  "raiseResourceCap(address,uint256)",
  "lowerResourceCap(address,uint256)",
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
];

// FRV has no per-resource cap, so its fast-track set is the queue + pause subset only.
export const FRV_FAST_TRACK = [
  "setInnerDepositQueue(address[])",
  "setInnerWithdrawQueue(address[])",
  "pauseResource(address)",
  "unpauseResource(address)",
];

// ---------------------------------------------------------------------------------------------------
// HubRegistry — the only two gated functions.
// ---------------------------------------------------------------------------------------------------
export const HUB_REGISTRY_GOVERNANCE = ["addHub(address)", "removeHub(address)"];

// ---------------------------------------------------------------------------------------------------
// Command builder: ACM.giveCallPermission(contract, roleString, account). `acm` is passed in by the
// caller so this module stays network-agnostic — each network's VIP supplies its own ACM from its
// address book (see addresses/<network>.ts).
// ---------------------------------------------------------------------------------------------------
export const giveCallPermission = (acm: string, contract: string, sig: string, account: string) => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

// NOTE on the testnet/mainnet split. bsctestnet-guardian.ts grants the Guardian HUB_FULL plus the
// full Governance set on every source — a testnet-only deviation, made to speed up iteration, that is
// deliberately NOT mirrored to mainnet. bscmainnet.ts applies the asymmetric model instead: the
// Normal Timelock holds the Governance sets, the Fast-Track timelock holds the *_FAST_TRACK sets, and
// the Operator holds only HUB_OPERATOR / CORE_FLUX_OPERATOR / FRV_OPERATOR (no registry, no
// Governance). Likewise the *_FAST_TRACK sets above are mainnet-only — on testnet the fast lanes hold
// the full Governance set for parity with the Normal Timelock.
