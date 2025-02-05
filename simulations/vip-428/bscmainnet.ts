import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip428 from "../../vips/vip-428/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45968919, async () => {
  testVip("VIP-428", await vip428(), {
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
