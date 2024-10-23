import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip371 from "../../vips/vip-371/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(44995536, async () => {
  testVip("vip371 XVS vault permission proposal", await vip371(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );
    },
  });
});
