import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip447 from "../../vips/vip-447/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46358601, async () => {
  testVip("VIP-447", await vip447(), {
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
