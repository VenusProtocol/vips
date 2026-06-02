import { ETHEREUM_BOUND_VALIDATOR, ETHEREUM_MIGRATIONS } from "../../vips/vip-999/utils/data";
import { runRemoteOracleSuite } from "./utils/remoteSuite";

runRemoteOracleSuite({
  blockNumber: 25228546,
  networkKey: "ethereum",
  boundValidator: ETHEREUM_BOUND_VALIDATOR,
  migrations: ETHEREUM_MIGRATIONS,
  assertPrices: true,
});
