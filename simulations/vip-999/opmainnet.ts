import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking } from "src/vip-framework";

import { checkRemoteBridge } from "./utils/checkRemoteBridge";

forking(150714025, async () => {
  await checkRemoteBridge({
    description: "Optimism",
    proxyOFTDest: "0xbBe46bAec851355c3FC4856914c47eB6Cea0B8B4",
    xvs: NETWORK_ADDRESSES.opmainnet.XVS,
    resilientOracle: NETWORK_ADDRESSES.opmainnet.RESILIENT_ORACLE,
  });
});
