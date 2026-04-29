import { forking } from "src/vip-framework";

import { BASEMAINNET_CONFIG } from "../../vips/vip-666/addresses/basemainnet";
import { runVip667Suite } from "./shared";

// Must be ≥ 45337626 — AerodromeSlipstreamOracle proxy deployment block.
const FORK_BLOCK = 45338981;

forking(FORK_BLOCK, async () => {
  await runVip667Suite(BASEMAINNET_CONFIG);
});
