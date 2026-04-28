import { forking } from "src/vip-framework";

import { ETHEREUM_CONFIG } from "../../vips/vip-666/addresses/ethereum";
import { runVip666Suite } from "./shared";

// TODO: set fork block once the EBrake/DeviationSentinel stack is deployed on Ethereum.
const FORK_BLOCK = 0;

forking(FORK_BLOCK, async () => {
  await runVip666Suite(ETHEREUM_CONFIG);
});
