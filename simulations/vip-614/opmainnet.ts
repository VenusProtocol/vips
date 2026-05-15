import { forking } from "src/vip-framework";

import { describeChainExecution } from "./utils/testForChain";

forking(150667815, async () => {
  await describeChainExecution("VIP-614 Optimism Core Pool Sunset Step 1", "opmainnet");
});
