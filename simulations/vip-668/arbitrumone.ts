import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip668 from "../../vips/vip-668/bscmainnet";
import { batchRoundTrip, expectUpgradeEvents, postUpgradeChecks, preUpgradeChecks } from "./shared";

forking(513176879, async () => {
  preUpgradeChecks("arbitrumone");
  testForkedNetworkVipCommands("VIP-668", await vip668(), { callbackAfterExecution: expectUpgradeEvents });
  postUpgradeChecks("arbitrumone");
  batchRoundTrip("arbitrumone");
});
