import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip394 from "../../vips/vip-394/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(43778615, async () => {
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
