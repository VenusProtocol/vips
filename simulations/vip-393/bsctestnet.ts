import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip393 from "../../vips/vip-393/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45188496, async () => {
  testVip("vip393", await vip393(), {
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
