import { forking } from "src/vip-framework";

import { ETHEREUM_CONFIG } from "../../vips/vip-616/addresses/ethereum";
import { runVip616Suite } from "./shared";

const FORK_BLOCK = 25027435;

forking(FORK_BLOCK, async () => {
  await runVip616Suite(ETHEREUM_CONFIG);
});
