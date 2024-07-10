import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip333 from "../../vips/vip-333/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

forking(6276156, async () => {
  testForkedNetworkVipCommands("vip333 oracle permissions", await vip333(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted", "PermissionRevoked"], [8, 6]);
    },
  });
});
