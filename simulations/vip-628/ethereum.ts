import { ETHEREUM_BOUND_VALIDATOR, ETHEREUM_MIGRATIONS } from "../../vips/vip-628/utils/data";
import { runRemoteOracleSuite } from "./utils/remoteSuite";

runRemoteOracleSuite({
  blockNumber: 25236078,
  networkKey: "ethereum",
  boundValidator: ETHEREUM_BOUND_VALIDATOR,
  migrations: ETHEREUM_MIGRATIONS,
});
