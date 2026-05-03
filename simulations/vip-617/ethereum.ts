import { forking } from "src/vip-framework";

import { ETHEREUM_CONFIG } from "../../vips/vip-616/addresses/ethereum";
import { runVip617Suite } from "./shared";

// Must be ≥ 24985630 — CurveOracle proxy deployment block.
const FORK_BLOCK = 24992834;

forking(FORK_BLOCK, async () => {
  await runVip617Suite(ETHEREUM_CONFIG);
});
