import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip504 from "../../vips/vip-504/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(52148327, async () => {
  testVip("VIP-504 bsctestnet", await vip504(), {
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
