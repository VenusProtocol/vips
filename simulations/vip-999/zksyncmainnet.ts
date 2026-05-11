import { forking } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bscmainnet";
import * as zksyncmainnetData from "../../vips/vip-999/data/zksyncmainnet";
import { runChainRiskParamSuite } from "./utils/chainRiskParamSuite";

const FORK_BLOCK = 70010061;

forking(FORK_BLOCK, async () => {
  await runChainRiskParamSuite("VIP-999 zkSync Era Core", "zksyncmainnet", zksyncmainnetData, await vip999());
});
