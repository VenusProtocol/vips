import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import { checkRemoteBridge } from "./utils/checkRemoteBridge";

forking(460315359, async () => {
  await checkRemoteBridge({
    description: "Arbitrum One",
    proxyOFTDest: "0x20cEa49B5F7a6DBD78cAE772CA5973eF360AA1e6",
    xvs: NETWORK_ADDRESSES.arbitrumone.XVS,
    resilientOracle: NETWORK_ADDRESSES.arbitrumone.RESILIENT_ORACLE,
  });
});
