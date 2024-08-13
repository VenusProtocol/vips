import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip019 from "../../multisig/proposals/opbnbtestnet/vip-019";
import vip350 from "../../vips/vip-350/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

forking(36325286, async () => {
  before(async () => {
    await pretendExecutingVip(await vip019());
  });

  testForkedNetworkVipCommands("vip350", await vip350(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [4]);
    },
  });
});
