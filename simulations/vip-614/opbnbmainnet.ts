import { forking } from "src/vip-framework";

import { describeChainExecution } from "./utils/testForChain";

forking(135269797, async () => {
  await describeChainExecution("VIP-614 opBNB Core Pool Sunset Step 1", "opbnbmainnet");
});
