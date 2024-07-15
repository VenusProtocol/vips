import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip333 from "../../vips/vip-333/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(40343666, async () => {
  testVip("vip333 XVS Bridge permission proposal", await vip333(), {
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
