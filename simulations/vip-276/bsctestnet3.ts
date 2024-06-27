import { TransactionResponse } from "@ethersproject/providers";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip276 } from "../../vips/vip-276/bsctestnet3";
import ACM_ABI from "./abi/AccessControlManager.json";

forking(38305471, async () => {
  testVip("VIP-CallPermission", await vip276(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(txResponse, [ACM_ABI], ["RoleGranted"], [1]);
    },
  });
});
