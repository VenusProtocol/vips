import { runRemoteSim } from "./utils/remoteSim";

// Recent arbitrumone block, after the ACMCommandsAggregator was seeded on-chain, where the CriticalTimelock
// still holds the permissions this VIP revokes.
runRemoteSim("arbitrumone", 484414000);
