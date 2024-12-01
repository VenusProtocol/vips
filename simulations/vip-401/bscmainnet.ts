import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip401 from "../../vips/vip-401/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(44489019, async () => {
  testVip("vip401", await vip401(), {
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
