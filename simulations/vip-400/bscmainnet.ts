import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip400 from "../../vips/vip-400/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(44324800, async () => {
  testVip("vip400 Arbitrum one Prime configuration", await vip400(), {
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
