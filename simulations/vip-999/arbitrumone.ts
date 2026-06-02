import { ARBITRUM_BOUND_VALIDATOR, ARBITRUM_MIGRATIONS } from "../../vips/vip-999/utils/data";
import { runRemoteOracleSuite } from "./utils/remoteSuite";

runRemoteOracleSuite({
  blockNumber: 469217050,
  networkKey: "arbitrumone",
  boundValidator: ARBITRUM_BOUND_VALIDATOR,
  migrations: ARBITRUM_MIGRATIONS,
  assertPrices: false,
});
