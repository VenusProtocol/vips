import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip507 from "../../vips/vip-507/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(49928270, async () => {
  testVip("VIP-507 bscmainnet", await vip507(), {
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
