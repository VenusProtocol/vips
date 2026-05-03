import { forking } from "src/vip-framework";

import { BASEMAINNET_CONFIG } from "../../vips/vip-616/addresses/basemainnet";
import { runVip617Suite } from "./shared";

// Must be ≥ 45337626 — AerodromeSlipstreamOracle proxy deployment block.
const FORK_BLOCK = 45338981;

forking(FORK_BLOCK, async () => {
  await runVip617Suite(BASEMAINNET_CONFIG);
});
