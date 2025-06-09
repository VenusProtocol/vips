import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip514 from "../../vips/vip-514/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(50971169, async () => {
  testVip("VIP-514 bscmainnet", await vip514(), {
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
