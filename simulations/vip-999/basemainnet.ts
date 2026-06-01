import { BASE_BOUND_VALIDATOR, BASE_MIGRATIONS } from "../../vips/vip-999/utils/data";
import { runRemoteOracleSuite } from "./utils/remoteSuite";

runRemoteOracleSuite({
  blockNumber: 46752679,
  networkKey: "basemainnet",
  boundValidator: BASE_BOUND_VALIDATOR,
  migrations: BASE_MIGRATIONS,
  assertPrices: true,
});
