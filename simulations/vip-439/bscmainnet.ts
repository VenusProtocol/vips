import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip439 from "../../vips/vip-439/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46358601, async () => {
  testVip("VIP-439", await vip439(), {
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
