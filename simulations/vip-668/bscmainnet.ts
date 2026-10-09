import { forking, testVip } from "src/vip-framework";

import vip668 from "../../vips/vip-668/bscmainnet";
import { batchRoundTrip, expectUpgradeEvents, postUpgradeChecks, preUpgradeChecks } from "./shared";

forking(126624281, async () => {
  preUpgradeChecks("bscmainnet");
  testVip("VIP-668", await vip668(), { callbackAfterExecution: expectUpgradeEvents });
  postUpgradeChecks("bscmainnet");
  batchRoundTrip("bscmainnet");
});
