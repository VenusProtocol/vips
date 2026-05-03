import { forking } from "src/vip-framework";

import { BASEMAINNET_CONFIG } from "../../vips/vip-666/addresses/basemainnet";
import { runVip666Suite } from "./shared";

const FORK_BLOCK = 45338981;

forking(FORK_BLOCK, async () => {
  await runVip666Suite(BASEMAINNET_CONFIG);
});
