import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip491 } from "../../vips/vip-491/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(51177545, async () => {
  testVip("VIP-491", await vip491(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [1]);
    },
  });
});
