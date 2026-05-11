import { forking } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bscmainnet";
import * as basemainnetData from "../../vips/vip-999/data/basemainnet";
import { runChainRiskParamSuite } from "./utils/chainRiskParamSuite";

const FORK_BLOCK = 45846867;

forking(FORK_BLOCK, async () => {
  await runChainRiskParamSuite("VIP-999 Base Core", "basemainnet", basemainnetData, await vip999());
});
