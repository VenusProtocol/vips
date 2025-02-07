import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip420 from "../../vips/vip-420/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45586318, async () => {
  testVip("VIP-420", await vip420(), {
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
