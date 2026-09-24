import { forking } from "src/vip-framework";

import { unichainmainnet } from "../../vips/vip-615/bscmainnet";
import { describeChainExecution } from "./utils/testForChain";

forking(46279006, async () => {
  await describeChainExecution("VIP-615 Unichain drain", unichainmainnet, "unichainmainnet", {
    vTreasury: unichainmainnet.vTreasury,
    nativeGateway: unichainmainnet.nativeTokenGateway_vWETH,
    normalTimelock: unichainmainnet.normalTimelock,
  });
});
