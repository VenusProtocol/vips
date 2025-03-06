import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip463 from "../../vips/vip-463/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47551000, async () => {
  testVip("VIP-463", await vip463(), {
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
