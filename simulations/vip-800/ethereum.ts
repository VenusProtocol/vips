import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip800, { ETHEREUM_CTX } from "../../vips/vip-800/bscmainnet";
import { buildPostExecutionEventChecks, runPostVipAssertions, runPreVipAssertions } from "./shared";

// Must postdate VIP-616 execution on Ethereum (which wires the 10 baseline markets
// at 10%). Update once VIP-616 lands on mainnet.
const FORK_BLOCK = 25129613;

forking(FORK_BLOCK, async () => {
  runPreVipAssertions(ETHEREUM_CTX);

  testForkedNetworkVipCommands("VIP-800 [Ethereum] DeviationSentinel Parameter Recommendation", await vip800(), {
    callbackAfterExecution: buildPostExecutionEventChecks(ETHEREUM_CTX),
  });

  runPostVipAssertions(ETHEREUM_CTX);
});
