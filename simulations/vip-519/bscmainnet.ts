import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip519 from "../../vips/vip-519/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(52000915, async () => {
  testVip("VIP-514 bscmainnet", await vip519(), {
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
