import { forking } from "src/vip-framework";

import { BASEMAINNET_CONFIG } from "../../vips/vip-666/addresses/basemainnet";
import { runVip666Suite } from "./shared";

// TODO: set fork block once the EBrake/DeviationSentinel stack is deployed on Base.
const FORK_BLOCK = 0;

forking(FORK_BLOCK, async () => {
  await runVip666Suite(BASEMAINNET_CONFIG);
});
