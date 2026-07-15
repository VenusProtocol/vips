import { runRemoteSim } from "./utils/remoteSim";

// Recent zksyncmainnet block where the CriticalTimelock still holds the permissions this VIP revokes.
runRemoteSim("zksyncmainnet", 71165006);
