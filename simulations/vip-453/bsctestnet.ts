import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip452 from "../../vips/vip-452/bsctestnet";
import vip453 from "../../vips/vip-453/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(48276592, async () => {
  testVip("vip452 give permissions to timelock", await vip452());
  testVip("VIP-453", await vip453(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [6, 0],
      );
    },
  });
});
