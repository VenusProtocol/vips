import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import { vip511 } from "../../vips/vip-511/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(50983014, async () => {
  testVip("VIP-511", await vip511(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [OMNICHAIN_PROPOSAL_SENDER_ABI], ["ExecuteRemoteProposal"], [1]);
    },
  });
});
