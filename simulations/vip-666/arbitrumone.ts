import { forking } from "src/vip-framework";

import { ARBITRUMONE_CONFIG } from "../../vips/vip-666/addresses/arbitrumone";
import { runVip666Suite } from "./shared";

// TODO: set fork block once the EBrake/DeviationSentinel stack is deployed on Arbitrum One.
const FORK_BLOCK = 0;

forking(FORK_BLOCK, async () => {
  await runVip666Suite(ARBITRUMONE_CONFIG);
});
