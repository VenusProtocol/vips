import { forking } from "src/vip-framework";

import { BASEMAINNET_CONFIG } from "../../vips/vip-616/addresses/basemainnet";
import { runVip616Suite } from "./shared";

const FORK_BLOCK = 45589260;

forking(FORK_BLOCK, async () => {
  await runVip616Suite(BASEMAINNET_CONFIG);
});
