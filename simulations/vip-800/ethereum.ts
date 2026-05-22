import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip800, { ETHEREUM_CTX } from "../../vips/vip-800/bscmainnet";
import {
  TestConfig,
  buildPostExecutionEventChecks,
  runBehaviorTests,
  runCommandCountAssertion,
  runConfigSanity,
  runPostVipAssertions,
  runPreVipAssertions,
} from "./shared";

// Must postdate VIP-616 execution on Ethereum (which wires the 10 baseline markets at 10%).
const FORK_BLOCK = 25129613;

const a = NETWORK_ADDRESSES.ethereum;

// Every VIP-800 Ethereum writeable market has a vToken in the Core IL pool
// (including crvUSD, which is in both Core and Curve — Core is sufficient).
const TEST_CONFIG: TestConfig = {
  ctx: ETHEREUM_CTX,
  resilientOracle: a.RESILIENT_ORACLE,
  chainlinkOracle: a.CHAINLINK_ORACLE,
  redstoneOracle: a.REDSTONE_ORACLE,
  timelock: a.NORMAL_TIMELOCK,
  comptrollers: [{ address: a.CORE_COMPTROLLER, type: "il" }],
  // Behavior tests run against markets whose ResilientOracle path is simple
  // Chainlink/RedStone. Excluded:
  //   - sUSDe / sUSDS  (ERC-4626 wrappers, not yet listed as Venus markets)
  //   - LBTC, eBTC, tBTC (OneJumpOracle ratio × BTC/USD — inner staleness opaque)
  // Structural tests still cover all of these. Follows VIP-616's SKIP_CHECK_PRICE_DEVIATION precedent.
  expectVToken: new Set(["USDC", "USDT", "USDe", "DAI", "WBTC", "crvUSD"]),
};

forking(FORK_BLOCK, async () => {
  runConfigSanity(TEST_CONFIG);
  runCommandCountAssertion("Ethereum", 17);
  runPreVipAssertions(TEST_CONFIG);

  testForkedNetworkVipCommands("VIP-800 [Ethereum] DeviationSentinel Parameter Recommendation", await vip800(), {
    callbackAfterExecution: buildPostExecutionEventChecks(ETHEREUM_CTX),
  });

  runPostVipAssertions(TEST_CONFIG);
  runBehaviorTests(TEST_CONFIG);
});
