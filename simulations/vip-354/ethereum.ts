import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip053 from "../../multisig/proposals/ethereum/vip-053";
import vip354 from "../../vips/vip-354/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

forking(20482317, async () => {
  before(async () => {
    await pretendExecutingVip(await vip053());
  });

  testForkedNetworkVipCommands("vip350", await vip354(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [18]);
    },
  });
});
