import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip451 from "../../vips/vip-451/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46587255, async () => {
  testVip("VIP-451", await vip451(), {
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
