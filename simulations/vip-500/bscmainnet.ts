import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip500 } from "../../vips/vip-500/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(48392030, async () => {
  testVip("VIP-500", await vip500(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );
    },
  });
});
