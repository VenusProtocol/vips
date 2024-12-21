import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip409 from "../../vips/vip-409/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45036507, async () => {
  testVip("VIP-409 Transfer ownership to Governance", await vip409(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [6, 0],
      );
    },
  });
});
