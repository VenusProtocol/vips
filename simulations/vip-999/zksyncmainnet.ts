import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import { checkRemoteBridge } from "./utils/checkRemoteBridge";

forking(69951618, async () => {
  await checkRemoteBridge({
    description: "zkSync Era",
    proxyOFTDest: "0x16a62B534e09A7534CD5847CFE5Bf6a4b0c1B116",
    xvs: NETWORK_ADDRESSES.zksyncmainnet.XVS,
    resilientOracle: NETWORK_ADDRESSES.zksyncmainnet.RESILIENT_ORACLE,
  });
});
