import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip465 from "../../vips/vip-465/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(48466884, async () => {
  testVip("VIP-465", await vip465(), {
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
