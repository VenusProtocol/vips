import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip416 from "../../vips/vip-416/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47415997, async () => {
  testVip("vip416 XVS vault permission proposal", await vip416(), {
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
