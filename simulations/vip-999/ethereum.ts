import { forking } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bscmainnet";
import * as ethereumData from "../../vips/vip-999/data/ethereum";
import { runChainRiskParamSuite } from "./utils/chainRiskParamSuite";

const FORK_BLOCK = 25070226;

forking(FORK_BLOCK, async () => {
  await runChainRiskParamSuite("VIP-999 Ethereum Core", "ethereum", ethereumData, await vip999());
});
