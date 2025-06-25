import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip523 from "../../vips/vip-523/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(52000915, async () => {
  testVip("VIP-523", await vip523(), {
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
