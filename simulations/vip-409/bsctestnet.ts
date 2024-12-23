import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip409 from "../../vips/vip-409/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46452753, async () => {
  testVip("Ethena", await vip409(), {
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
