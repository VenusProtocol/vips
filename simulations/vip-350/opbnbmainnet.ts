import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip020 from "../../multisig/proposals/opbnbmainnet/vip-020";
import vip350 from "../../vips/vip-350/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";

forking(31356515, async () => {
  before(async () => {
    await pretendExecutingVip(await vip020());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [6]);
    },
  });
});
