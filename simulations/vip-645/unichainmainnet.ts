import { runRemoteSim } from "./utils/remoteSim";

// Recent unichainmainnet block, after the ACMCommandsAggregator was seeded on-chain, where the
// CriticalTimelock still holds the permissions this VIP revokes.
runRemoteSim("unichainmainnet", 53446000);
