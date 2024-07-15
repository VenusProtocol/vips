import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip334 from "../../vips/vip-334/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

forking(20274111, async () => {
  testForkedNetworkVipCommands("vip334 XVS permissions", await vip334(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [16]);
    },
  });
});
