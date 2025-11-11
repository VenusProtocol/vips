import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip565 } from "../../vips/vip-565/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(67819954, async () => {
  testVip("VIP-565", await vip565(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [1]);
    },
  });
});
