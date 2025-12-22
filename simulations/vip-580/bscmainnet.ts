import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip580 } from "../../vips/vip-580/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(70217238, async () => {
  testVip("VIP-565", await vip580(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [1]);
    },
  });
});
