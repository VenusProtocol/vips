import { forking, testVip } from "src/vip-framework";

import vip800, { BSC_CTX } from "../../vips/vip-800/bscmainnet";
import { buildPostExecutionEventChecks, runPostVipAssertions, runPreVipAssertions } from "./shared";

// FORK_BLOCK must be ≥ the BSC block at which VIP-613 executes (which configures the
// 25 BSC markets at 10%). If VIP-613 hasn't been executed on the chosen block, the
// pre-VIP assertions in shared.ts will fail loudly with deviation=0 for retune entries.
// Update this once VIP-613 is on mainnet.
const FORK_BLOCK = 95000000;

forking(FORK_BLOCK, async () => {
  runPreVipAssertions(BSC_CTX);

  testVip("VIP-800 [BSC] DeviationSentinel Parameter Recommendation", await vip800(), {
    callbackAfterExecution: buildPostExecutionEventChecks(BSC_CTX),
  });

  runPostVipAssertions(BSC_CTX);
});
