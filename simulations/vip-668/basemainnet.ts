import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip668 from "../../vips/vip-668/bscmainnet";
import { batchRoundTrip, expectUpgradeEvents, postUpgradeChecks, preUpgradeChecks } from "./shared";

forking(52377217, async () => {
  preUpgradeChecks("basemainnet");
  testForkedNetworkVipCommands("VIP-668", await vip668(), { callbackAfterExecution: expectUpgradeEvents });
  postUpgradeChecks("basemainnet");
  batchRoundTrip("basemainnet");
});
