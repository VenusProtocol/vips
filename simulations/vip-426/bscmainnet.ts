import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip426 from "../../vips/vip-426/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45909768, async () => {
  testVip("VIP-426", await vip426(), {
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
