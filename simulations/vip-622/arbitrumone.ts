import { forking } from "src/vip-framework";

import vip622 from "../../vips/vip-622/bscmainnet";
import * as arbitrumoneData from "../../vips/vip-622/data/arbitrumone";
import { runChainRiskParamSuite } from "./utils/chainRiskParamSuite";

const FORK_BLOCK = 462416157;

forking(FORK_BLOCK, async () => {
  await runChainRiskParamSuite("VIP-622 Arbitrum Core", "arbitrumone", arbitrumoneData, await vip622());
});
