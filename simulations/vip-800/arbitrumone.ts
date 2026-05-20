import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip800, { ARBITRUMONE_CTX } from "../../vips/vip-800/bscmainnet";
import {
  TestConfig,
  buildPostExecutionEventChecks,
  runBehaviorTests,
  runCommandCountAssertion,
  runConfigSanity,
  runPostVipAssertions,
  runPreVipAssertions,
} from "./shared";

const FORK_BLOCK = 464476747;

const a = NETWORK_ADDRESSES.arbitrumone;

const TEST_CONFIG: TestConfig = {
  ctx: ARBITRUMONE_CTX,
  resilientOracle: a.RESILIENT_ORACLE,
  chainlinkOracle: a.CHAINLINK_ORACLE,
  redstoneOracle: a.REDSTONE_ORACLE,
  timelock: a.NORMAL_TIMELOCK,
  comptrollers: [{ address: a.CORE_COMPTROLLER, type: "il" }],
  expectVToken: new Set(["USDC", "USD₮0", "WBTC"]),
};

forking(FORK_BLOCK, async () => {
  runConfigSanity(TEST_CONFIG);
  runCommandCountAssertion("Arbitrum One", 3);
  runPreVipAssertions(TEST_CONFIG);

  testForkedNetworkVipCommands("VIP-800 [Arbitrum One] DeviationSentinel Parameter Recommendation", await vip800(), {
    callbackAfterExecution: buildPostExecutionEventChecks(ARBITRUMONE_CTX),
  });

  runPostVipAssertions(TEST_CONFIG);
  runBehaviorTests(TEST_CONFIG);
});
