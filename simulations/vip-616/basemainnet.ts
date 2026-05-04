import { forking } from "src/vip-framework";

import { BASEMAINNET_CONFIG } from "../../vips/vip-616/addresses/basemainnet";
import { runVip616Suite } from "./shared";

const FORK_BLOCK = 45338981; // TODO: update to block after DeviationSentinelConfiguratorBaseMainnet deployment

forking(FORK_BLOCK, async () => {
  await runVip616Suite(BASEMAINNET_CONFIG);
});
