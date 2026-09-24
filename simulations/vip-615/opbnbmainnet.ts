import { forking } from "src/vip-framework";

import { opbnbmainnet } from "../../vips/vip-615/bscmainnet";
import { describeChainExecution } from "./utils/testForChain";

forking(135653166, async () => {
  await describeChainExecution("VIP-615 opBNB drain", opbnbmainnet, "opbnbmainnet", {
    vTreasury: opbnbmainnet.vTreasury,
    nativeGateway: opbnbmainnet.nativeTokenGateway_vWBNB,
    normalTimelock: opbnbmainnet.normalTimelock,
  });
});
