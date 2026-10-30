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
// VIP-675: the comptroller roles of every spoke pool. VIP-668 and VIP-670 grant 20 against `Comptroller_HubSpoke`
// only. VIP-675 grants all 20 against address(0), which covers this pool, the bStock index pool and any later spoke
// pool, so a later pool needs no ACM grant. It then revokes the bStock index pool's own grants of those 20, and
// CollateralGateway's grant on Core, which the wildcard covers too.
//
// Where else each wildcard reaches, besides spoke comptrollers and the sunset BSC isolated pools:
//  - SPOKE_POOL_REGISTRY's six: Core's `setCollateralFactor`, EBrake's caps and FRV's `setCloseFactor`. The registry
//    calls only the comptroller passed to the ACM-gated `addPool`, or a registered pool's in `addMarket`.
//  - The Critical Guardian's `setCloseFactor`: FRV's LiquidationAdapter, where it has no access today. It is the only
//    one of the Critical Guardian's five that FRV checks.
//  - CollateralGateway's `enterMarketForAccount`: Core, where the gateway already holds it.
//
// The registry, rate model, market and Spoke source calls use wildcards and Risk Steward grants that already reach a
// new comptroller (VIP-668's ASSUMED_WILDCARDS and RISK_STEWARD_GRANTS, VIP-673's YieldGroup wildcards).
// ===================================================================================================

/// The six setters SPOKE_POOL_REGISTRY drives during `addPool` and `addMarket`. Inline, before `addPool`, which
/// reverts without them.
export const REGISTRY_WILDCARDS: Grant[] = REGISTRY_GRANTS.map(role => ({ role, account: SPOKE_POOL_REGISTRY }));

/// The other 14: the Normal Timelock's six, the Critical Guardian's five, the Pause Guardian's two and
/// CollateralGateway's `enterMarketForAccount`, in the aggregator batch.
export const OTHER_WILDCARDS: Grant[] = [
  ...NORMAL_TIMELOCK_GRANTS.map(role => ({ role, account: NORMAL_TIMELOCK })),
  ...CRITICAL_GUARDIAN_GRANTS.map(role => ({ role, account: CRITICAL_GUARDIAN })),
  ...PAUSE_GUARDIAN_GRANTS.map(role => ({ role, account: PAUSE_GUARDIAN })),
  ...ROUTER_ROLES.map(role => ({ role, account: COLLATERAL_GATEWAY })),
];

/// The 20 wildcards. The bStock index pool holds each as a scoped grant, which the aggregator batch revokes after them.
export const VIP_675_WILDCARDS: Grant[] = [...REGISTRY_WILDCARDS, ...OTHER_WILDCARDS];

/// CollateralGateway's scoped grant on Core, which its VIP-675 wildcard covers. Revoked after the wildcard.
export const CORE_GRANTS_REPLACED: Grant[] = ROUTER_ROLES.map(role => ({ role, account: COLLATERAL_GATEWAY }));

/// The roles the Normal Timelock calls inline on existing contracts to price the new assets, each an exact grant it
/// already holds. The batch setters on Atlas, APRO, the ResilientOracle and the BoundValidator check the single
/// setter's role; the DBO's has one of its own.
export const VIP_675_ORACLE_ROLES: { contract: string; role: string }[] = [
  ...[ATLAS_ORACLE, APRO_ORACLE, RESILIENT_ORACLE].map(contract => ({ contract, role: "setTokenConfig(TokenConfig)" })),
  { contract: BOUND_VALIDATOR, role: "setValidateConfig(ValidateConfig)" },
  { contract: DEVIATION_BOUNDED_ORACLE, role: "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])" },
];

/// The registry roles `addPool`, `addMarket` and `updatePoolMetadata` check. The Normal Timelock holds each as a
/// wildcard (VIP-668's ASSUMED_WILDCARDS), so no VIP-675 grant covers them.
export const VIP_675_REGISTRY_ROLES = [
  "addPool(string,address,uint256,uint256,uint256)",
  "addMarket(AddMarketInput)",
  "updatePoolMetadata(address,VenusPoolMetaData)",
];
