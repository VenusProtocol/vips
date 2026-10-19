import { SPOKE_SOURCE_ROLES, YIELD_GROUP_BASE_ROLES } from "./permissions";

// ===================================================================================================
// VIP-997 — ACM role strings for SpokeSource_USDT on BNB Chain Testnet.
//
// The Spoke family is the generic `YieldGroup` behind its own beacon, so its gated surface is exactly
// the Core / Flux one: the eight `YieldGroupBase` functions plus the three `YieldGroup` adds. The strings
// live in ./permissions.ts, shared with the bscmainnet proposals, with the source lines they are copied from.
// ===================================================================================================

export const YIELD_GROUP_BASE = YIELD_GROUP_BASE_ROLES;

// The full gated surface of SpokeSource_USDT.
export const SPOKE_SOURCE_GOVERNANCE = SPOKE_SOURCE_ROLES;

// ---------------------------------------------------------------------------------------------------
// Who holds what on testnet.
//
// The three timelocks get the full surface, mirroring how the earlier testnet proposals granted the
// Core and Flux sources: each timelock holds all eleven of these per contract on both, and none holds
// a wildcard, so every grant below is load-bearing. The Normal Timelock needs three of them inside this
// very proposal (`addResource` and the two inner-queue setters), which is why the grants run first.
//
// The Guardian gets nothing on the source, because it already holds all eleven as address(0)
// wildcards on the testnet ACM, and a wildcard reaches a contract deployed after it was made. The same
// holds on the Hub: it holds every yield-group setter there twice over, as an exact grant on Hub_USDT
// and as a wildcard. So every change the Guardian needs to make to this family later (resources,
// adapters, inner and outer queue order, caps, pauses, sweep) is already within reach without a
// proposal. Re-granting them would add 11 commands that change nothing; instead the simulation asserts
// each one before and after execution, so a revoked wildcard fails the simulation rather than leaving
// the Guardian short.
// ---------------------------------------------------------------------------------------------------

/// Held by the Guardian as address(0) wildcards, verified with `hasRole` on chain.
export const GUARDIAN_WILDCARDS = SPOKE_SOURCE_GOVERNANCE;

/// Granted every signature: no timelock holds a wildcard on any of them.
export const TIMELOCK_GRANTS = SPOKE_SOURCE_GOVERNANCE;

/// Only what the Guardian's wildcards miss, which today is nothing.
export const GUARDIAN_GRANTS = SPOKE_SOURCE_GOVERNANCE.filter(sig => !GUARDIAN_WILDCARDS.includes(sig));

/// The Hub-side setters that act on a single yield group, plus the operator's `reallocate`. Not granted
/// by this proposal: the three timelocks and the Guardian already hold all of them on Hub_USDT. Listed
/// so the simulation can assert that, since the case for granting the Guardian nothing rests on it.
export const HUB_YIELD_GROUP_SETTERS = [
  "addYieldGroup(address,uint256,uint16)",
  "removeYieldGroup(address)",
  "raiseYieldGroupCap(address,uint256,uint16)",
  "lowerYieldGroupCap(address,uint256,uint16)",
  "pauseYieldGroup(address)",
  "unpauseYieldGroup(address)",
  "setOuterDepositQueue(address[])",
  "setOuterWithdrawQueue(address[])",
  "emergencyReallocate((address,address,uint256)[],(address,address,uint256)[])",
];
export const REALLOCATE = "reallocate((address,address,uint256)[],(address,address,uint256)[])";

/// SpokeComptroller's allowlist setter (isolated-pools PR #559, SpokeComptroller.sol). Held by the
/// Normal Timelock and the Guardian as exact grants on Comptroller_HubSpoke, made by the spoke pool's
/// listing proposal.
export const SET_ALLOWED_SUPPLIER = "setAllowedSupplier(address,address,bool)";

export const giveCallPermission = (acm: string, contract: string, sig: string, account: string) => ({
  target: acm,
  signature: "giveCallPermission(address,string,address)",
  params: [contract, sig, account],
});
