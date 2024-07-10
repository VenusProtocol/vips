import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip333 from "../../vips/vip-333/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(41938696, async () => {
  testVip("vip333 permissions of oracles", await vip333(), {
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
