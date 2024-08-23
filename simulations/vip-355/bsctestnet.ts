import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip355 from "../../vips/vip-355/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(42106572, async () => {
  testVip("vip355", await vip355(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );
    },
  });
});
