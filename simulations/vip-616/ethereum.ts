import { forking } from "src/vip-framework";

import { ETHEREUM_CONFIG } from "../../vips/vip-616/addresses/ethereum";
import { runVip616Suite } from "./shared";

const FORK_BLOCK = 24992853; // TODO: update to block after DeviationSentinelConfiguratorEthereum deployment

forking(FORK_BLOCK, async () => {
  await runVip616Suite(ETHEREUM_CONFIG);
});
