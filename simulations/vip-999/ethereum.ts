import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import { checkRemoteBridge } from "./utils/checkRemoteBridge";

forking(25042861, async () => {
  await checkRemoteBridge({
    description: "Ethereum",
    proxyOFTDest: "0x888E317606b4c590BBAD88653863e8B345702633",
    xvs: NETWORK_ADDRESSES.ethereum.XVS,
    resilientOracle: NETWORK_ADDRESSES.ethereum.RESILIENT_ORACLE,
  });
});
