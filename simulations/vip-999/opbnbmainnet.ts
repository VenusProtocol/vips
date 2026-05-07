import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import { checkRemoteBridge } from "./utils/checkRemoteBridge";

forking(140149995, async () => {
  await checkRemoteBridge({
    description: "opBNB",
    proxyOFTDest: "0x100D331C1B5Dcd41eACB1eCeD0e83DCEbf3498B2",
    xvs: NETWORK_ADDRESSES.opbnbmainnet.XVS,
    resilientOracle: NETWORK_ADDRESSES.opbnbmainnet.RESILIENT_ORACLE,
  });
});
