import { TransactionResponse } from "@ethersproject/providers";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip476 from "../../vips/vip-476/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(49471679, async () => {
  testVip("VIP-476", await vip476(), {
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
