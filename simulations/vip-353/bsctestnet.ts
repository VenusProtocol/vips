import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip353 from "../../vips/vip-353/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(41938696, async () => {
  testVip("vip353 XVS vault permission proposal", await vip353(), {
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