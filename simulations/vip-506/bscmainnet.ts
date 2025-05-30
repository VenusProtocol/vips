import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip506 } from "../../vips/vip-506/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(50348237, async () => {
  testVip("VIP-506", await vip506(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [1]);
    },
  });
});
