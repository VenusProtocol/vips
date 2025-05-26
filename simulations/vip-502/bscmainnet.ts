import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip502 from "../../vips/vip-502/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(48841700, async () => {
  testVip("VIP-502", await vip502(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });
});
