import { runRemoteSim } from "./utils/remoteSim";

// Recent basemainnet block where the CriticalTimelock still holds the permissions this VIP revokes.
runRemoteSim("basemainnet", 48618074);
