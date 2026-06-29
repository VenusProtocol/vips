import { BASE_BOUND_VALIDATOR, BASE_MIGRATIONS } from "../../vips/vip-628/utils/data";
import { runRemoteOracleSuite } from "./utils/remoteSuite";

runRemoteOracleSuite({
  blockNumber: 46800096,
  networkKey: "basemainnet",
  boundValidator: BASE_BOUND_VALIDATOR,
  migrations: BASE_MIGRATIONS,
});
