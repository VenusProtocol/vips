import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip495 } from "../../vips/vip-495/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(49530846, async () => {
  testVip("VIP-495", await vip495(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [1]);
    },
  });
});
