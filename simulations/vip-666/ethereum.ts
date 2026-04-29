import { forking } from "src/vip-framework";

import { ETHEREUM_CONFIG } from "../../vips/vip-666/addresses/ethereum";
import { runVip666Suite } from "./shared";

const FORK_BLOCK = 24985871;

forking(FORK_BLOCK, async () => {
  await runVip666Suite(ETHEREUM_CONFIG);
});
