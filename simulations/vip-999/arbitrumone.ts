import { ARBITRUM_BOUND_VALIDATOR, ARBITRUM_MIGRATIONS } from "../../vips/vip-999/utils/data";
import { runRemoteOracleSuite } from "./utils/remoteSuite";

runRemoteOracleSuite({
  blockNumber: 468888361,
  networkKey: "arbitrumone",
  boundValidator: ARBITRUM_BOUND_VALIDATOR,
  migrations: ARBITRUM_MIGRATIONS,
  // L2 Chainlink MAIN feeds use a sequencer-uptime feed the local fork EVM can't execute.
  assertPrices: false,
});
