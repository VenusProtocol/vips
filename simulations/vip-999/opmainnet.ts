import { forking } from "src/vip-framework";

import { opmainnet } from "../../vips/vip-999/bscmainnet";
import { describeChainExecution } from "./utils/testForChain";

forking(150667815, async () => {
  await describeChainExecution("VIP-999 Optimism drain", opmainnet, "opmainnet", {
    vTreasury: "0x104c01EB7b4664551BE6A9bdB26a8C5c6Be7d3da",
    nativeGateway: opmainnet.nativeTokenGateway_vWETH,
  });
});
