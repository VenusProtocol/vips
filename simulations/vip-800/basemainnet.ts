import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip800, { BASEMAINNET_CTX } from "../../vips/vip-800/bscmainnet";
import { buildPostExecutionEventChecks, runPostVipAssertions, runPreVipAssertions } from "./shared";

// Must postdate VIP-616 execution on Base. Update once VIP-616 lands.
const FORK_BLOCK = 46204283;

forking(FORK_BLOCK, async () => {
  runPreVipAssertions(BASEMAINNET_CTX);

  testForkedNetworkVipCommands("VIP-800 [Base] DeviationSentinel Parameter Recommendation", await vip800(), {
    callbackAfterExecution: buildPostExecutionEventChecks(BASEMAINNET_CTX),
  });

  runPostVipAssertions(BASEMAINNET_CTX);
});
