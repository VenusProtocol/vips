import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip436 from "../../vips/vip-436/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46110084, async () => {
  testVip("VIP-436", await vip436({}), {
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
