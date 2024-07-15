import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip335 from "../../vips/vip-335/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(41938696, async () => {
  testVip("vip335 XVS permission proposal", await vip335(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );
    },
  });
});
