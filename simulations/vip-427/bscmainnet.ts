import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip427 from "../../vips/vip-427/bscmainnetPartA";
import vip429 from "../../vips/vip-427/bscmainnetPartB";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45789159, async () => {
  testVip("VIP-427", await vip427(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [2, 0],
      );
    },
  });

  testVip("VIP-429", await vip429(), {
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
