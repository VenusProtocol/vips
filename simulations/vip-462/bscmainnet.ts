import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip462 from "../../vips/vip-462/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47225425, async () => {
  testVip("Accept ownerships/admins", await vip462(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });
});
