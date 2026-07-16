import { runRemoteSim } from "./utils/remoteSim";

// Recent opmainnet block, after the ACMCommandsAggregator was seeded on-chain, where the CriticalTimelock
// still holds the permissions this VIP revokes.
runRemoteSim("opmainnet", 154297800);
