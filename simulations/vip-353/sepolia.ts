import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip053 from "../../multisig/proposals/sepolia/vip-052";
import vip353 from "../../vips/vip-353/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

forking(6460097, async () => {
  before(async () => {
    await pretendExecutingVip(await vip053());
  });

  testForkedNetworkVipCommands("vip350", await vip353(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [18]);
    },
  });
});
