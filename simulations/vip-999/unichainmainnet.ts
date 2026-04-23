import { forking } from "src/vip-framework";

import { unichainmainnet } from "../../vips/vip-999/bscmainnet";
import { describeChainExecution } from "./utils/testForChain";

forking(46202394, async () => {
  await describeChainExecution("VIP-999 Unichain drain", unichainmainnet, "unichainmainnet", {
    vTreasury: "0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B",
    nativeGateway: unichainmainnet.nativeTokenGateway_vWETH,
  });
});
