import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip433 from "../../vips/vip-433/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45795963, async () => {
  testVip("Accept ownerships/admins", await vip433(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [2, 0],
      );
    },
  });
});
