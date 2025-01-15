import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip421PartA from "../../vips/vip-421/bscmainnetPartA";
import vip421PartB from "../../vips/vip-421/bscmainnetPartB";
import vip421PartC from "../../vips/vip-421/bscmainnetPartC";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45789159, async () => {
  testVip("VIP-421 Part A", await vip421PartA(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  testVip("VIP-421 Part B", await vip421PartB(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  testVip("VIP-421 Part C", await vip421PartC(), {
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
