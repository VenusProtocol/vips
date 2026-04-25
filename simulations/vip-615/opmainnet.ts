import { forking } from "src/vip-framework";

import { opmainnet } from "../../vips/vip-615/bscmainnet";
import { describeChainExecution } from "./utils/testForChain";

forking(150714025, async () => {
  await describeChainExecution("VIP-615 Optimism drain", opmainnet, "opmainnet", {
    vTreasury: opmainnet.vTreasury,
    nativeGateway: opmainnet.nativeTokenGateway_vWETH,
    normalTimelock: opmainnet.normalTimelock,
  });
});
