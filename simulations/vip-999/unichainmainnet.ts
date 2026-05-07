import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import { checkRemoteBridge } from "./utils/checkRemoteBridge";

forking(47406178, async () => {
  await checkRemoteBridge({
    description: "Unichain",
    proxyOFTDest: "0x9c95f8aa28fFEB7ECdC0c407B9F632419c5daAF8",
    xvs: NETWORK_ADDRESSES.unichainmainnet.XVS,
    resilientOracle: NETWORK_ADDRESSES.unichainmainnet.RESILIENT_ORACLE,
  });
});
