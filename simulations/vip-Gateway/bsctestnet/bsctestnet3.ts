import { TransactionResponse } from "@ethersproject/providers";

import { expectEvents } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { vipCallPermission } from "../../../vips/vip-Gateway/bsctestnet3";
import ACM_ABI from "../abi/AccessControlManager.json";

forking(38305471, () => {
  testVip("VIP-CallPermission", vipCallPermission(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [17]);
    },
  });
});
