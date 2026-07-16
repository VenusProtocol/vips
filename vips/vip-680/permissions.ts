import { ACM } from "./addresses";

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
// HubRegistry — the only two gated functions.
// ---------------------------------------------------------------------------------------------------
export const HUB_REGISTRY_GOVERNANCE = ["addHub(address)", "removeHub(address)"];

// ---------------------------------------------------------------------------------------------------
// Command builder: ACM.giveCallPermission(contract, roleString, account). ACM is the single ACM the
// Hub stack checks against (see addresses.ts).
// ---------------------------------------------------------------------------------------------------
export const giveCallPermission = (contract: string, sig: string, account: string) => ({
  target: ACM,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});

// NOTE for a future mainnet VIP: the mainnet Guardian must receive ONLY the Operator sets
// (HUB_OPERATOR on the Hub, CORE_FLUX_OPERATOR on Core/Flux, FRV_OPERATOR on FRV — no registry, no
// Governance). HUB_FULL / the full-Governance Guardian grant in bsctestnet-guardian.ts is a
// testnet-only deviation and must not be mirrored to mainnet.
