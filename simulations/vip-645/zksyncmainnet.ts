import { runRemoteSim } from "./utils/remoteSim";

// Recent zksyncmainnet block, after the ACMCommandsAggregator was seeded on-chain, where the CriticalTimelock
// still holds the permissions this VIP revokes.
runRemoteSim("zksyncmainnet", 71188600);
