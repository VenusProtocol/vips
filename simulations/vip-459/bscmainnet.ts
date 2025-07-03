import { TransactionResponse } from "@ethersproject/providers";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip459 from "../../vips/vip-459/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47062101, async () => {
  testVip("VIP-459", await vip459(), {
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
