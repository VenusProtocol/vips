import { forking } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bscmainnet";
import * as arbitrumoneData from "../../vips/vip-999/data/arbitrumone";
import { describeChainExecution } from "./utils/verifyChain";

const FORK_BLOCK = 461663720;

forking(FORK_BLOCK, async () => {
  await describeChainExecution("VIP-999 Arbitrum Core", "arbitrumone", arbitrumoneData, await vip999());
});
