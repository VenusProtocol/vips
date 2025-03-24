import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip445 from "../../vips/vip-445/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47754551, async () => {
  testVip("VIP-445", await vip445(), {
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
