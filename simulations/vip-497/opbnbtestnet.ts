import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip497 from "../../vips/vip-497/bsctestnet";
import ACM_ABI from "./abi/ACM.json";

forking(64030948, async () => {
  testForkedNetworkVipCommands("vip497", await vip497(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });
});
