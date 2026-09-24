import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip658, { BASEMAINNET_CTX } from "../../vips/vip-658/bscmainnet";
import {
  TestConfig,
  buildPostExecutionEventChecks,
  runCommandCountAssertion,
  runConfigSanity,
  runPostVipAssertions,
  runPreVipAssertions,
} from "./shared";

// Recent Base block (post the Base Guardian's block-50298851 USDC retune, so the
// pre-VIP assertions validate live state). USDC / cbBTC / wstETH all wired at 3%
// on-chain here. No pool changes on Base.
const FORK_BLOCK = 50503680;

const a = NETWORK_ADDRESSES.basemainnet;

// Structural pre/post-VIP + event-count assertions only (no trip-behavior tests — see shared.ts).
const TEST_CONFIG: TestConfig = {
  ctx: BASEMAINNET_CTX,
  resilientOracle: a.RESILIENT_ORACLE,
  timelock: a.NORMAL_TIMELOCK,
  comptrollers: [{ address: a.CORE_COMPTROLLER, type: "il" }],
};

forking(FORK_BLOCK, async () => {
  runConfigSanity(TEST_CONFIG);
  runCommandCountAssertion(BASEMAINNET_CTX, 3);
  runPreVipAssertions(TEST_CONFIG);

  testForkedNetworkVipCommands("VIP-658 [Base] DeviationSentinel 2026-08 Parameter Adjustment", await vip658(), {
    callbackAfterExecution: buildPostExecutionEventChecks(BASEMAINNET_CTX),
  });

  runPostVipAssertions(TEST_CONFIG);
});
