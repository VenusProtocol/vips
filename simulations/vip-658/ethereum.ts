import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip658, { ETHEREUM_CTX } from "../../vips/vip-658/bscmainnet";
import {
  TestConfig,
  buildPostExecutionEventChecks,
  runCommandCountAssertion,
  runConfigSanity,
  runPostVipAssertions,
  runPreVipAssertions,
} from "./shared";

// All in-scope markets are wired per the V2 doc's "current" column (sUSDe / sUSDS were
// wired by VIP-624; WETH stays at 10%). Uses a block where the LayerZero receive library
// on the fork is valid (blocks nearer head hit "invalid default library" in receivePayload).
const FORK_BLOCK = 25590000;

const a = NETWORK_ADDRESSES.ethereum;

// Trip-behavior (checkPriceDeviation) tests are intentionally not run here — see the
// note in shared.ts. Only structural pre/post-VIP + event-count assertions run on the
// remote chains, so no oracle/vToken behavior-test fields are needed.
const TEST_CONFIG: TestConfig = {
  ctx: ETHEREUM_CTX,
  resilientOracle: a.RESILIENT_ORACLE,
  timelock: a.NORMAL_TIMELOCK,
  comptrollers: [{ address: a.CORE_COMPTROLLER, type: "il" }],
};

forking(FORK_BLOCK, async () => {
  runConfigSanity(TEST_CONFIG);
  runCommandCountAssertion("Ethereum", 26);
  runPreVipAssertions(TEST_CONFIG);

  testForkedNetworkVipCommands("VIP-658 [Ethereum] DeviationSentinel 2026-08 Parameter Adjustment", await vip658(), {
    callbackAfterExecution: buildPostExecutionEventChecks(ETHEREUM_CTX),
  });

  runPostVipAssertions(TEST_CONFIG);
});
