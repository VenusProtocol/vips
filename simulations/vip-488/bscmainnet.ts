import { TransactionResponse } from "@ethersproject/providers";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip488 from "../../vips/vip-488/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(48669730, async () => {
  testVip("VIP-488", await vip488(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });
});
