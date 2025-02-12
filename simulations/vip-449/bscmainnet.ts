import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip449 from "../../vips/vip-449/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46586698, async () => {
  testVip("update supply caps", await vip449(), {
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
