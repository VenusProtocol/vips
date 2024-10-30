import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip389 from "../../vips/vip-389/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45188496, async () => {
  testVip("vip389", await vip389(), {
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
