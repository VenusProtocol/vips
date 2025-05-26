import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip501 } from "../../vips/vip-501/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(50348237, async () => {
  testVip("VIP-501", await vip501(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [1]);
    },
  });
});
