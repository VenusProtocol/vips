import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip425 from "../../vips/vip-425/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45847517, async () => {
  testVip("VIP-425", await vip425(), {
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
