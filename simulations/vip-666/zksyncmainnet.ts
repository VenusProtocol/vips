import { forking } from "src/vip-framework";

import { ZKSYNCMAINNET_CONFIG } from "../../vips/vip-666/addresses/zksyncmainnet";
import { runVip666Suite } from "./shared";

// TODO: set fork block once the EBrake/DeviationSentinel stack is deployed on zkSync Era.
const FORK_BLOCK = 0;

forking(FORK_BLOCK, async () => {
  await runVip666Suite(ZKSYNCMAINNET_CONFIG);
});
