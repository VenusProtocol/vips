import { ROUTER_ROLES } from "../vip-671/permissions";
import { Grant } from "../vip-671/permissions-bscmainnet";
import {
  APRO_ORACLE,
  ATLAS_ORACLE,
  BOUND_VALIDATOR,
  COLLATERAL_GATEWAY,
  DEVIATION_BOUNDED_ORACLE,
  HUB_STACKS,
  RESILIENT_ORACLE,
} from "./addresses/bscmainnet";

export * from "../vip-672/permissions-bscmainnet";

// ===================================================================================================
// VIP-673: the one grant, and the roles it calls on existing contracts.
//
// Read from the ACM on 2026-10-14 with `hasRole` for the exact grant (block ~127,552,000) and on the wildcard key
// described in ../vip-672/permissions-bscmainnet.ts for the wildcard (block 127,594,075). The Normal Timelock holds
// every role below as an exact grant, none as a wildcard. VIP-673's comptroller, registry, market and Spoke source
// calls use VIP-671's and VIP-672's grants and the wildcards in ASSUMED_WILDCARDS.
// ===================================================================================================

/// `enterMarketForAccount(address,address)` on `Comptroller_HubSpoke`, to `CollateralGateway` only. The gateway passes
/// its own caller as the account; any other holder could enter any account into a market.
export const VIP_673_GRANTS: Grant[] = ROUTER_ROLES.map(role => ({ role, account: COLLATERAL_GATEWAY }));

/// The batch setters on Atlas, APRO, `ResilientOracle` and `BoundValidator` loop the single setter and check its role.
/// The DBO's batch setter checks a role of its own.
export const VIP_673_ROLES_CALLED: { contract: string; role: string }[] = [
  ...[ATLAS_ORACLE, APRO_ORACLE, RESILIENT_ORACLE].map(contract => ({ contract, role: "setTokenConfig(TokenConfig)" })),
  { contract: BOUND_VALIDATOR, role: "setValidateConfig(ValidateConfig)" },
  { contract: DEVIATION_BOUNDED_ORACLE, role: "setTokenConfigs((address,uint64,uint256,uint256,bool,bool)[])" },
  ...HUB_STACKS.map(({ hub }) => ({ contract: hub, role: "setOuterDepositQueue(address[])" })),
];
