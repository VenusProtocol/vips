import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import { checkRemoteBridge } from "./utils/checkRemoteBridge";

forking(45682400, async () => {
  await checkRemoteBridge({
    description: "Base",
    proxyOFTDest: "0x3dD92fB51a5d381Ae78E023dfB5DD1D45D2426Cd",
    xvs: NETWORK_ADDRESSES.basemainnet.XVS,
    resilientOracle: NETWORK_ADDRESSES.basemainnet.RESILIENT_ORACLE,
  });
});
