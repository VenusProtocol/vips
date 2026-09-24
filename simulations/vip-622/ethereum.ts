import { forking } from "src/vip-framework";

import vip622 from "../../vips/vip-622/bscmainnet";
import * as ethereumData from "../../vips/vip-622/data/ethereum";
import { runChainRiskParamSuite } from "./utils/chainRiskParamSuite";

const FORK_BLOCK = 25086778;

forking(FORK_BLOCK, async () => {
  await runChainRiskParamSuite("VIP-622 Ethereum Core", "ethereum", ethereumData, await vip622());
});
