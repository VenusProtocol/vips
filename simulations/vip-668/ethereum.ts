import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip668 from "../../vips/vip-668/bscmainnet";
import { batchRoundTrip, expectUpgradeEvents, postUpgradeChecks, preUpgradeChecks } from "./shared";

forking(26154421, async () => {
  preUpgradeChecks("ethereum");
  testForkedNetworkVipCommands("VIP-668", await vip668(), { callbackAfterExecution: expectUpgradeEvents });
  postUpgradeChecks("ethereum");
  batchRoundTrip("ethereum");
});
