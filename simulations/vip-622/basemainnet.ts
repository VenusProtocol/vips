import { forking } from "src/vip-framework";

import vip622 from "../../vips/vip-622/bscmainnet";
import * as basemainnetData from "../../vips/vip-622/data/basemainnet";
import { runChainRiskParamSuite } from "./utils/chainRiskParamSuite";

const FORK_BLOCK = 45945731;

forking(FORK_BLOCK, async () => {
  await runChainRiskParamSuite("VIP-622 Base Core", "basemainnet", basemainnetData, await vip622());
});
