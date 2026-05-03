import { forking } from "src/vip-framework";

import { ARBITRUMONE_CONFIG } from "../../vips/vip-616/addresses/arbitrumone";
import { runVip617Suite } from "./shared";

const FORK_BLOCK = 457434103;

forking(FORK_BLOCK, async () => {
  await runVip617Suite(ARBITRUMONE_CONFIG);
});
