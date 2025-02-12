import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip449 from "../../vips/vip-449/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46587255, async () => {
  testVip("VIP-449", await vip449(), {
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
