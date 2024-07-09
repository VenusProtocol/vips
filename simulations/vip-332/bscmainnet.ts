import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip332 from "../../vips/vip-332/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(40325799, async () => {
  testVip("vip332 ownership of VTreasury", await vip332(), {
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
