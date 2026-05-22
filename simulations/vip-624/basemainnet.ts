import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip624, { BASEMAINNET_CTX } from "../../vips/vip-624/bscmainnet";
import {
  TestConfig,
  buildPostExecutionEventChecks,
  runBehaviorTests,
  runCommandCountAssertion,
  runConfigSanity,
  runPostVipAssertions,
  runPreVipAssertions,
} from "./shared";

const FORK_BLOCK = 46204283;

const a = NETWORK_ADDRESSES.basemainnet;

const TEST_CONFIG: TestConfig = {
  ctx: BASEMAINNET_CTX,
  resilientOracle: a.RESILIENT_ORACLE,
  chainlinkOracle: a.CHAINLINK_ORACLE,
  redstoneOracle: a.REDSTONE_ORACLE,
  timelock: a.NORMAL_TIMELOCK,
  comptrollers: [{ address: a.CORE_COMPTROLLER, type: "il" }],
  // wstETH excluded — its price routes through a ratio oracle (wstETH/ETH × ETH/USD)
  // whose internal staleness can't be overridden from the fork. Structural tests still
  // cover it. Follows VIP-616's SKIP_CHECK_PRICE_DEVIATION precedent.
  expectVToken: new Set(["USDC", "cbBTC"]),
};

forking(FORK_BLOCK, async () => {
  runConfigSanity(TEST_CONFIG);
  runCommandCountAssertion("Base", 3);
  runPreVipAssertions(TEST_CONFIG);

  testForkedNetworkVipCommands("VIP-624 [Base] DeviationSentinel Parameter Recommendation", await vip624(), {
    callbackAfterExecution: buildPostExecutionEventChecks(BASEMAINNET_CTX),
  });

  runPostVipAssertions(TEST_CONFIG);
  runBehaviorTests(TEST_CONFIG);
});
