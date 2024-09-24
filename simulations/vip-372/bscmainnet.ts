import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip372 from "../../vips/vip-372/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(40343666, async () => {
  testVip("vip372 XVS vault permission proposal", await vip372(), {
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
