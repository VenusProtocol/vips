import {
  LOWER_RESOURCE_CAP,
  PAUSE_RESOURCE,
  RAISE_RESOURCE_CAP,
  SET_INNER_DEPOSIT_QUEUE,
  SET_INNER_WITHDRAW_QUEUE,
  SPOKE_SOURCE_ROLES,
  UNPAUSE_RESOURCE,
  UPDATE_RESOURCE_ADAPTER,
} from "../vip-671/permissions";
import { Grant } from "../vip-671/permissions-bscmainnet";
import { NORMAL_TIMELOCK, OPERATOR, PAUSE_GUARDIAN } from "./addresses/bscmainnet";

export * from "../vip-671/permissions-bscmainnet";

// ===================================================================================================
// VIP-672: ACM grants on each Spoke source, and the Hub and yield-group roles it calls with.
//
// Read from the ACM on 2026-10-14 with `hasRole(keccak256(contract, role), account)` for the exact grant (block
// 127,532,699) and `hasRole` on the wildcard key for the wildcard (block 127,594,075), for the Normal, Fast-track and
// Critical timelocks, both guardians, the Oracle Guardian and the Operator, on all eleven live yield groups and all
// three Hubs. No account holds any of these roles as a wildcard. The mainnet ACM keys a wildcard on 32 zero bytes
// before the role, not a 20-byte address(0); `isAllowedToCall` from an unrelated sender agrees.
// ===================================================================================================

/// On all six live Core and Flux sources (the same generic `YieldGroup` as Spoke), the Normal Timelock holds all
/// eleven source roles, the Pause Guardian three and the Operator six; the Fast-track and Critical timelocks, the
/// Critical Guardian and the Oracle Guardian hold none. Each Spoke source gets the same.
export const SPOKE_SOURCE_NORMAL_TIMELOCK_GRANTS = SPOKE_SOURCE_ROLES;

/// Incident levers. The Pause Guardian also holds `pauseYieldGroup` on every Hub.
export const SPOKE_SOURCE_PAUSE_GUARDIAN_GRANTS = [UPDATE_RESOURCE_ADAPTER, PAUSE_RESOURCE, UNPAUSE_RESOURCE];

/// Routing inside the source. Not `addResource`, which stays with the Normal Timelock.
export const SPOKE_SOURCE_OPERATOR_GRANTS = [
  SET_INNER_DEPOSIT_QUEUE,
  SET_INNER_WITHDRAW_QUEUE,
  PAUSE_RESOURCE,
  UNPAUSE_RESOURCE,
  RAISE_RESOURCE_CAP,
  LOWER_RESOURCE_CAP,
];

/// The 20 grants on one Spoke source. VIP-672 issues them on each of the three, 60 in all, never against address(0).
export const SPOKE_SOURCE_GRANTS: Grant[] = [
  ...SPOKE_SOURCE_NORMAL_TIMELOCK_GRANTS.map(role => ({ role, account: NORMAL_TIMELOCK })),
  ...SPOKE_SOURCE_PAUSE_GUARDIAN_GRANTS.map(role => ({ role, account: PAUSE_GUARDIAN })),
  ...SPOKE_SOURCE_OPERATOR_GRANTS.map(role => ({ role, account: OPERATOR })),
];

/// Roles VIP-672 calls on existing contracts. The Normal Timelock holds each as an exact grant, not a wildcard.
export const HUB_ROLES_CALLED = ["addYieldGroup(address,uint256,uint16)", "setOuterWithdrawQueue(address[])"];
export const YIELD_GROUP_ROLES_CALLED = [UPDATE_RESOURCE_ADAPTER];
