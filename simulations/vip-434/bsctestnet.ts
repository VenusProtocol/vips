import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip434 from "../../vips/vip-434/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47754551, async () => {
  testVip("VIP-434", await vip434(), {
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
