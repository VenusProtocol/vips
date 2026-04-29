import { forking } from "src/vip-framework";

import { ARBITRUMONE_CONFIG } from "../../vips/vip-666/addresses/arbitrumone";
import { runVip667Suite } from "./shared";

const FORK_BLOCK = 457434103;

forking(FORK_BLOCK, async () => {
  await runVip667Suite(ARBITRUMONE_CONFIG);
});
