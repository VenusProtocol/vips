import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip566 from "../../vips/vip-566/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(67672815, async () => {
  testVip("VIP-566", await vip566(), {
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
