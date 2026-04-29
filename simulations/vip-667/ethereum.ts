import { forking } from "src/vip-framework";

import { ETHEREUM_CONFIG } from "../../vips/vip-666/addresses/ethereum";
import { runVip667Suite } from "./shared";

const FORK_BLOCK = 24982817;

forking(FORK_BLOCK, async () => {
  await runVip667Suite(ETHEREUM_CONFIG);
});
