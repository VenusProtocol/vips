import { ROUTER_ROLES } from "../vip-668/permissions";
import {
  CRITICAL_GUARDIAN_GRANTS,
  Grant,
  NORMAL_TIMELOCK_GRANTS,
  PAUSE_GUARDIAN_GRANTS,
  REGISTRY_GRANTS,
} from "../vip-668/permissions-bscmainnet";
import {
  APRO_ORACLE,
  ATLAS_ORACLE,
  BOUND_VALIDATOR,
  COLLATERAL_GATEWAY,
  CRITICAL_GUARDIAN,
  DEVIATION_BOUNDED_ORACLE,
  NORMAL_TIMELOCK,
  PAUSE_GUARDIAN,
  RESILIENT_ORACLE,
  SPOKE_POOL_REGISTRY,
} from "./addresses/bscmainnet";

export * from "../vip-670/permissions-bscmainnet";

// ===================================================================================================
// VIP-674: the grants on `Comptroller_Bluechips`. The same 19 VIP-668 gives `Comptroller_HubSpoke` and the one VIP-670
// gives CollateralGateway, each against the new comptroller and never as a wildcard. None carries over from the
// bStock index pool: every one of them names that comptroller, not address(0).
//
// The registry, rate model, market and Spoke source calls use wildcards and Risk Steward grants that already reach a
// new comptroller (VIP-668's ASSUMED_WILDCARDS and RISK_STEWARD_GRANTS, VIP-673's YieldGroup wildcards).
// ===================================================================================================

/// The six setters SPOKE_POOL_REGISTRY drives during `addPool` and `addMarket`. Inline, before `addPool`, which
/// reverts without them.
export const REGISTRY_GRANTS_BLUECHIPS: Grant[] = REGISTRY_GRANTS.map(role => ({ role, account: SPOKE_POOL_REGISTRY }));

/// The other 14: the Normal Timelock's six, the Critical Guardian's five, the Pause Guardian's two and
/// CollateralGateway's `enterMarketForAccount`. Nothing in VIP-674 needs them first, so they run in the aggregator
/// batch.
export const OTHER_GRANTS_BLUECHIPS: Grant[] = [
  ...NORMAL_TIMELOCK_GRANTS.map(role => ({ role, account: NORMAL_TIMELOCK })),
  ...CRITICAL_GUARDIAN_GRANTS.map(role => ({ role, account: CRITICAL_GUARDIAN })),
  ...PAUSE_GUARDIAN_GRANTS.map(role => ({ role, account: PAUSE_GUARDIAN })),
  ...ROUTER_ROLES.map(role => ({ role, account: COLLATERAL_GATEWAY })),
];

export const VIP_674_GRANTS: Grant[] = [...REGISTRY_GRANTS_BLUECHIPS, ...OTHER_GRANTS_BLUECHIPS];

/// The roles the Normal Timelock calls inline on existing contracts to price the new assets, each an exact grant it
/// already holds. The batch setters on Atlas, APRO, the ResilientOracle and the BoundValidator check the single
/// setter's role; the DBO's has one of its own.
export const VIP_674_ORACLE_ROLES: { contract: string; role: string }[] = [
  ...[ATLAS_ORACLE, APRO_ORACLE, RESILIENT_ORACLE].map(contract => ({ contract, role: "setTokenConfig(TokenConfig)" })),
  { contract: BOUND_VALIDATOR, role: "setValidateConfig(ValidateConfig)" },
  { contract: DEVIATION_BOUNDED_ORACLE, role: "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])" },
];

/// The registry roles `addPool` and `addMarket` check. The Normal Timelock holds both as wildcards (VIP-668's
/// ASSUMED_WILDCARDS), so no VIP-674 grant covers them.
export const VIP_674_REGISTRY_ROLES = ["addPool(string,address,uint256,uint256,uint256)", "addMarket(AddMarketInput)"];
