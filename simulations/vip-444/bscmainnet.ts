import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip444 from "../../vips/vip-444/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46110084, async () => {
  testVip("VIP-444", await vip444(), {
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
