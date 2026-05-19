import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip800, { ARBITRUMONE_CTX } from "../../vips/vip-800/bscmainnet";
import { buildPostExecutionEventChecks, runPostVipAssertions, runPreVipAssertions } from "./shared";

const FORK_BLOCK = 464476747;

forking(FORK_BLOCK, async () => {
  runPreVipAssertions(ARBITRUMONE_CTX);

  testForkedNetworkVipCommands("VIP-800 [Arbitrum One] DeviationSentinel Parameter Recommendation", await vip800(), {
    callbackAfterExecution: buildPostExecutionEventChecks(ARBITRUMONE_CTX),
  });

  runPostVipAssertions(ARBITRUMONE_CTX);
});
