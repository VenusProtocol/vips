import { forking } from "src/vip-framework";

import { unichainmainnet } from "../../vips/vip-999/bscmainnet";
import { describeChainExecution } from "./utils/testForChain";

forking(46279006, async () => {
  await describeChainExecution("VIP-999 Unichain drain", unichainmainnet, "unichainmainnet", {
    vTreasury: unichainmainnet.vTreasury,
    nativeGateway: unichainmainnet.nativeTokenGateway_vWETH,
    normalTimelock: unichainmainnet.normalTimelock,
  });
});
