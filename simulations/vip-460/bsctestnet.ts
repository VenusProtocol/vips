import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip459 from "../../vips/vip-459/bsctestnet";
import vip460 from "../../vips/vip-460/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(48276592, async () => {
  testVip("VIP-453", await vip459());
  testVip("VIP-454", await vip460(), {
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
