import { runRemoteSim } from "./utils/remoteSim";

// Recent ethereum block, after the ACMCommandsAggregator was seeded on-chain, where the CriticalTimelock
// still holds the permissions this VIP revokes.
runRemoteSim("ethereum", 25544300);
