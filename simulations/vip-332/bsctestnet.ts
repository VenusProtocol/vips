import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip332 from "../../vips/vip-332/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(41938701, async () => {
  testVip("vip332 Ownership of Vtreasury", await vip332(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [2, 0],
      );
    },
  });
});
