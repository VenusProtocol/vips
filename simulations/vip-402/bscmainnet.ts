import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip402 from "../../vips/vip-402/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(43771100, async () => {
  testVip("LBTC", await vip402(), {
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
