import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip435Addendum from "../../vips/vip-435/bsctestnet-addendum";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47754551, async () => {
  testVip("gmBTC market on Arbitrum Sepolia", await vip435Addendum(), {
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
