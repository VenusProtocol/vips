import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip441 from "../../vips/vip-441/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46188598, async () => {
  testVip("VIP-441", await vip441(), {
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
