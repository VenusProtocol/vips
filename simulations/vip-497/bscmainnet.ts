import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip497 } from "../../vips/vip-497/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(48392030, async () => {
  testVip("VIP-497", await vip497(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [4]);
    },
  });
});
