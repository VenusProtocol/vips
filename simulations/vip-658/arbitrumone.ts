import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip658, { ARBITRUMONE_CTX } from "../../vips/vip-658/bscmainnet";
import {
  TestConfig,
  buildPostExecutionEventChecks,
  runCommandCountAssertion,
  runConfigSanity,
  runPostVipAssertions,
  runPreVipAssertions,
} from "./shared";

// Recent Arbitrum One block (node-supported, used by recent VIP sims). USDC / USD₮0
// wired at 1%, WBTC at 3%, ARB at 10% (VIP-616 wire, left as-is by VIP-624).
const FORK_BLOCK = 474085204;

const a = NETWORK_ADDRESSES.arbitrumone;

// Structural pre/post-VIP + event-count assertions only (no trip-behavior tests — see shared.ts).
const TEST_CONFIG: TestConfig = {
  ctx: ARBITRUMONE_CTX,
  resilientOracle: a.RESILIENT_ORACLE,
  timelock: a.NORMAL_TIMELOCK,
  comptrollers: [{ address: a.CORE_COMPTROLLER, type: "il" }],
};

forking(FORK_BLOCK, async () => {
  runConfigSanity(TEST_CONFIG);
  runCommandCountAssertion("Arbitrum One", 7);
  runPreVipAssertions(TEST_CONFIG);

  testForkedNetworkVipCommands(
    "VIP-658 [Arbitrum One] DeviationSentinel 2026-08 Parameter Adjustment",
    await vip658(),
    {
      callbackAfterExecution: buildPostExecutionEventChecks(ARBITRUMONE_CTX),
    },
  );

  runPostVipAssertions(TEST_CONFIG);
});
