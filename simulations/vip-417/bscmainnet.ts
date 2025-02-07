import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip417 from "../../vips/vip-417/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45507918, async () => {
  testVip("VIP-417", await vip417(), {
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
