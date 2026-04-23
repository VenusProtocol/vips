import { forking } from "src/vip-framework";

import { opbnbmainnet } from "../../vips/vip-999/bscmainnet";
import { describeChainExecution } from "./utils/testForChain";

forking(135269797, async () => {
  await describeChainExecution("VIP-999 opBNB drain", opbnbmainnet, "opbnbmainnet", {
    vTreasury: "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52",
    nativeGateway: opbnbmainnet.nativeTokenGateway_vWBNB,
  });
});
