import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip579 from "../../vips/vip-779/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(72972280, async () => {
  testVip("VIP-566", await vip579(), {
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