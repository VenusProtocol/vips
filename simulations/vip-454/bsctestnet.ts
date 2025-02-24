import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip454 from "../../vips/vip-454/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(48467727, async () => {
  testVip("Add WstETH market to Base sepolia and ZKsync sepolia", await vip454(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [2, 0],
      );
    },
  });
});
