import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip060 from "../../multisig/proposals/sepolia/vip-060";
import vip373 from "../../vips/vip-373/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";

forking(6831661, async () => {
  before(async () => {
    await pretendExecutingVip(await vip060());
  });

  testForkedNetworkVipCommands("vip373", await vip373(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [95]);
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionRevoked"], [42]);
    },
  });
});
