import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip531 from "../../vips/vip-531/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(53432462, async () => {
  testVip("VIP-531", await vip531(), {
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
