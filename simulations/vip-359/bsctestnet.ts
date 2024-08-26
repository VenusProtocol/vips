import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip359 from "../../vips/vip-359/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(42106572, async () => {
  testVip("vip359", await vip359(), {
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
