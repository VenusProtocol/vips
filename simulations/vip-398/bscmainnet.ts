import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip398 from "../../vips/vip-398/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(44169313, async () => {
  testVip("vip398 Arbitrum one Prime configuration", await vip398(), {
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
