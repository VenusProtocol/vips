import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip501 from "../../vips/vip-501/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(52148327, async () => {
  testVip("VIP-501 bsctestnet", await vip501(), {
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
