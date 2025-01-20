import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip427 from "../../vips/vip-427/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47551000, async () => {
  testVip("VIP-423", await vip427(), {
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
