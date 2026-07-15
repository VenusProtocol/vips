import { runRemoteSim } from "./utils/remoteSim";

// Recent ethereum block where the CriticalTimelock still holds the permissions this VIP revokes.
runRemoteSim("ethereum", 25530333);
