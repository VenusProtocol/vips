import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip493 } from "../../vips/vip-493/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(51177545, async () => {
  testVip("VIP-493", await vip493(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [2]);
    },
  });
});
