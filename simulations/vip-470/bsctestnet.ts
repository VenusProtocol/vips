import { TransactionResponse } from "@ethersproject/providers";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip470 from "../../vips/vip-470/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(49471679, async () => {
  testVip("VIP-470", await vip470(), {
    callbackAfterExecution: async (txResponse: TransactionResponse) => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [7, 0],
      );
    },
  });
});
