import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip504 from "../../vips/vip-504/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(49928270, async () => {
  testVip("VIP-504 bscmainnet", await vip504(), {
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
