import { expectEvents } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip333 from "../../vips/vip-333/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

forking(28761242, async () => {
  testForkedNetworkVipCommands("vip333 oracles permissions", await vip333(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted", "RoleRevoked"], [5, 3]);
    },
  });
});
