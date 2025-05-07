import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip492 } from "../../vips/vip-492/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(48392030, async () => {
  testVip("VIP-491", await vip492(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [3]);
    },
  });
});
