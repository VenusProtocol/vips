// ===================================================================================================
// VIP-680 — Liquidity Hub (USDT) ACM role-string sets.
//
// Every string is the literal function signature passed to `_checkAccessAllowed(...)` in the deployed
// contracts (the ACM role is `keccak256(targetContract, roleString)`), copied verbatim from
// venus-liquidity-hub/contracts. Roles by holder (mainnet policy, per the shipment plan's permission
// tables): Governance holds everything; the Operator is the routine keeper (raise/lower caps, pause,
// reorder queues, plus the operator-exclusive `reallocate`); the Guardian is the instant emergency
// multisig (pause + `emergencyReallocate` + FRV `forceRemoveResource`). Only Governance may unpause,
// change fees, add/remove, or repoint an adapter.
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

// Operator role set (the routine keeper): raise AND lower the yield-group cap, lower the per-tx cap,
// reorder the outer queues, pause the Hub or a yield group, plus the operator-exclusive `reallocate`.
// `raiseYieldGroupCap` is included so the keeper can open headroom before a `reallocate` push without a
// governance round. It gets no unpause, no raise-per-tx, no fees, no add/remove, and no `sweep`.
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

// Operator sets on the sources. Core/Flux: raise and lower the per-resource cap, reorder inner queues,
// pause a resource. FRV has no per-resource cap, so its operator set is the queue + pause subset only.
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
// Guardian sets (mainnet). The Venus Guardian multisig acts instantly, with no timelock delay, so it
// holds only the pure-containment levers: pause at every level (Hub, yield group, resource),
// `emergencyReallocate` (route funds out of danger — the sole fund-mover that still works while the Hub
// is paused), and `forceRemoveResource` on FRV (evict a bricked vault). It deliberately holds NO
// unpause (loosening is governance-only, so the Guardian can contain but can never undo a
// governance-ordered pause), NO cap changes (raising caps is the Operator's headroom lever, not an
// emergency one), no queues, no fees, no adapter repointing, and nothing on the registry. Every string
// below is a strict subset of the matching Governance set above.
// ---------------------------------------------------------------------------------------------------
export const HUB_GUARDIAN = [
  "pauseHub()",
  "pauseYieldGroup(address)",
  "emergencyReallocate((address,address,uint256)[],(address,address,uint256)[])",
];

// Core & Flux: pause a resource.
export const CORE_FLUX_GUARDIAN = ["pauseResource(address)"];

// FRV: pause a resource plus the emergency eviction lever for a bricked vault.
export const FRV_GUARDIAN = ["pauseResource(address)", "forceRemoveResource(address)"];

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
// full Governance set on every source — a testnet-only convenience for fast iteration, deliberately
// NOT mirrored to mainnet. bscmainnet.ts applies the asymmetric model from the README instead: the
// Normal Timelock holds the Governance sets and the registry; the Guardian holds only the emergency
// *_GUARDIAN subsets above; the Operator holds only HUB_OPERATOR / CORE_FLUX_OPERATOR / FRV_OPERATOR
// plus `reallocate` (no registry, no Governance). The Critical and Fast-Track Timelocks receive
// nothing on the Hub stack.
