import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip532 from "../../vips/vip-532/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(53432462, async () => {
  testVip("VIP-532", await vip532(), {
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
