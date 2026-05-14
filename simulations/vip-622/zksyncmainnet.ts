import { forking } from "src/vip-framework";

import vip622 from "../../vips/vip-622/bscmainnet";
import * as zksyncmainnetData from "../../vips/vip-622/data/zksyncmainnet";
import { runChainRiskParamSuite } from "./utils/chainRiskParamSuite";

const FORK_BLOCK = 70010061;

forking(FORK_BLOCK, async () => {
  await runChainRiskParamSuite("VIP-622 zkSync Era Core", "zksyncmainnet", zksyncmainnetData, await vip622());
});
