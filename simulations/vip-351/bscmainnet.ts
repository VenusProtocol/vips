import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip351 from "../../vips/vip-351/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(40343666, async () => {
  testVip("vip350 XVS vault permission proposal", await vip351(), {
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
