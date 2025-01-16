import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip411 from "../../vips/vip-411/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45031950, async () => {
  testVip("Ethena", await vip411(), {
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