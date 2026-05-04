import { forking } from "src/vip-framework";

import { ARBITRUMONE_CONFIG } from "../../vips/vip-616/addresses/arbitrumone";
import { runVip616Suite } from "./shared";

const FORK_BLOCK = 457580585; // TODO: update to block after DeviationSentinelConfiguratorArbitrumOne deployment

forking(FORK_BLOCK, async () => {
  await runVip616Suite(ARBITRUMONE_CONFIG);
});
