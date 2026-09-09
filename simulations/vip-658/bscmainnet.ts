import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testVip } from "src/vip-framework";

import vip658, { BSC_CTX } from "../../vips/vip-658/bscmainnet";
import {
  TestConfig,
  buildPostExecutionEventChecks,
  runCommandCountAssertion,
  runConfigSanity,
  runDisableBehaviorTests,
  runPostVipAssertions,
  runPreVipAssertions,
} from "./shared";

// Near BSC head (2026-08-26). All in-scope BSC markets are wired per the V2 doc's
// "current" column; DAI is already disabled (VIP-644) and TUSD is still enabled.
const FORK_BLOCK = 118190000;

const a = NETWORK_ADDRESSES.bscmainnet;

// Trusted keeper on the DeviationSentinel (verified on-chain, same as VIP-644) —
// used to prove that TUSD's market can no longer be acted on once disabled.
const GUARDIAN = "0x1C2CAc6ec528c20800B2fe734820D87b581eAA6B";

const TEST_CONFIG: TestConfig = {
  ctx: BSC_CTX,
  resilientOracle: a.RESILIENT_ORACLE,
  timelock: a.NORMAL_TIMELOCK,
  comptrollers: [{ address: a.UNITROLLER, type: "core" }],
  keeper: GUARDIAN, // proves the disabled TUSD market reverts handleDeviation
};

forking(FORK_BLOCK, async () => {
  runConfigSanity(TEST_CONFIG);
  runCommandCountAssertion(BSC_CTX, 14);
  runPreVipAssertions(TEST_CONFIG);

  testVip("VIP-658 [BSC] DeviationSentinel 2026-08 Parameter Adjustment", await vip658(), {
    callbackAfterExecution: buildPostExecutionEventChecks(BSC_CTX),
  });

  runPostVipAssertions(TEST_CONFIG);
  runDisableBehaviorTests(TEST_CONFIG);
});
