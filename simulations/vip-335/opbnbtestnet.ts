import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip335 from "../../vips/vip-335/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

forking(33739110, async () => {
  testForkedNetworkVipCommands("vip335 XVS permissions", await vip335(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [16]);
    },
  });
});
