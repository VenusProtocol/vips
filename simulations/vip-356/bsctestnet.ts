import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip356 from "../../vips/vip-356/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(42106572, async () => {
  testVip("vip356", await vip356(), {
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
