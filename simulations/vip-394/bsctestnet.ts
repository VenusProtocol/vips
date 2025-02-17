import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip394 from "../../vips/vip-394/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45194889, async () => {
  testVip("vip394", await vip394(), {
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
