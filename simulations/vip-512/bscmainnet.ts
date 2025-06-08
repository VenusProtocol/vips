import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip512 } from "../../vips/vip-512/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(51090121, async () => {
  testVip("VIP-512", await vip512(), {
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
