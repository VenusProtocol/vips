import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip492 } from "../../vips/vip-492/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(51177545, async () => {
  testVip("VIP-492", await vip492(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [4]);
    },
  });
});
