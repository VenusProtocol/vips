import { runRemoteSim } from "./utils/remoteSim";

// Recent opbnbmainnet block, after the ACMCommandsAggregator was seeded on-chain, where the CriticalTimelock
// still holds the permissions this VIP revokes.
runRemoteSim("opbnbmainnet", 164310000);
