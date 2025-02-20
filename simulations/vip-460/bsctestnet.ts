import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip460 from "../../vips/vip-460/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47551000, async () => {
  testVip("VIP-460", await vip460(), {
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
