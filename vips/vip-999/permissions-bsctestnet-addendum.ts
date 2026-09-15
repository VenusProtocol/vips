import {
  CENTRIFUGE_ASYNC_REQUESTS,
  CENTRIFUGE_CLAIMS,
  GUARDIAN_WILDCARDS,
  YIELD_GROUP_BASE,
} from "./permissions-bsctestnet";

export { GUARDIAN_WILDCARDS, giveCallPermission } from "./permissions-bsctestnet";

// A band around the value a fund reports, not a bound on its price. Never reverts, never pauses.
export const CENTRIFUGE_NAV_GUARD = [
  "setNavGuardRate(address,uint16,uint16,uint16,uint32,bool,bool)",
  "setNavGuardSnapshot(address,uint128,uint64)",
  "setNavGuardEnabled(address,bool,bool)",
];

export const SET_SPOT_APY = "setSpotAPYBps(address,uint64)";

export const CENTRIFUGE_NEW_SURFACE = [
  ...YIELD_GROUP_BASE,
  "forceRemoveResource(address)",
  ...CENTRIFUGE_ASYNC_REQUESTS,
  ...CENTRIFUGE_CLAIMS,
  ...CENTRIFUGE_NAV_GUARD,
  SET_SPOT_APY,
];

// Granted every signature: the timelock holds no wildcards at all.
export const NEW_TIMELOCK_GRANTS = CENTRIFUGE_NEW_SURFACE;

// Granted only what its wildcards miss, which is everything Centrifuge-specific — those functions
// did not exist when the wildcards were handed out.
export const NEW_GUARDIAN_GRANTS = CENTRIFUGE_NEW_SURFACE.filter(sig => !GUARDIAN_WILDCARDS.includes(sig));
