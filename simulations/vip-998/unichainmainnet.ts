import { forking } from "src/vip-framework";

import { describeChainExecution } from "./utils/testForChain";

forking(46186171, async () => {
  await describeChainExecution("VIP-998 Unichain Core Pool Sunset Step 1", "unichainmainnet");
});
