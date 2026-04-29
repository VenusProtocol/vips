import { forking } from "src/vip-framework";

import { BASEMAINNET_CONFIG } from "../../vips/vip-666/addresses/basemainnet";
import { runVip667Suite } from "./shared";

const FORK_BLOCK = 45320649;

forking(FORK_BLOCK, async () => {
  await runVip667Suite(BASEMAINNET_CONFIG);
});
