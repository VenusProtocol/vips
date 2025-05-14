import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip492 from "../../vips/vip-492/bsctestnet";
import ACM_ABI from "./abi/ACM.json";

forking(64030948, async () => {
  testForkedNetworkVipCommands("vip492", await vip492(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACM_ABI], ["PermissionGranted"], [9]);
    },
  });
});
