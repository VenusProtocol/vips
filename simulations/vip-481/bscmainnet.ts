import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip481 } from "../../vips/vip-481/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(48392030, async () => {
  testVip("VIP-481", await vip481(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [1]);
    },
  });
});
