import { runRemoteSim } from "./utils/remoteSim";

// Recent basemainnet block, after the ACMCommandsAggregator was seeded on-chain, where the CriticalTimelock
// still holds the permissions this VIP revokes.
runRemoteSim("basemainnet", 48702500);
