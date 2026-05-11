import { forking } from "src/vip-framework";

import vip999 from "../../vips/vip-999/bscmainnet";
import * as ethereumData from "../../vips/vip-999/data/ethereum";
import { describeChainExecution } from "./utils/verifyChain";

const FORK_BLOCK = 25070226;

forking(FORK_BLOCK, async () => {
  await describeChainExecution("VIP-999 Ethereum Core", "ethereum", ethereumData, await vip999());
});
