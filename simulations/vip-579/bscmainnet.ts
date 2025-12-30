import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip579 from "../../vips/vip-579/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(70217238, async () => {
  testVip("VIP-579", await vip579(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [1]);
    },
  });
});
