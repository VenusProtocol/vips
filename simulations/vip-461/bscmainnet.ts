import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip461 from "../../vips/vip-461/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46847530, async () => {
  testVip("Add WstETH market to Zksync mainnet", await vip461({}), {
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
