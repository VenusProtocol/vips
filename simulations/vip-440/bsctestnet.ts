import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip440 from "../../vips/vip-440/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47751975, async () => {
  testVip("VIP-440", await vip440(), {
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
