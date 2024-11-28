import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip405 from "../../vips/vip-405/bsctestnet";
import ACM_COMMANDS_AGGREGATOR_ABI from "./abi/ACMCommandsAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46024012, async () => {
  testVip("VIP 405 Multichain Governance - Permissions", await vip405(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [5, 0],
      );

      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [2]);
      await expectEvents(txResponse, [ACM_COMMANDS_AGGREGATOR_ABI], ["GrantPermissionsExecuted"], [1]);
    },
  });
});
