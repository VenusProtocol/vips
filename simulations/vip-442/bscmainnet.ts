import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip442 from "../../vips/vip-442/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import VTREASURY_ABI from "./abi/treasury.json";

forking(46329666, async () => {
  testVip("VIP-442", await vip442(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
      await expectEvents(txResponse, [VTREASURY_ABI], ["WithdrawTreasuryBNB"], [1]);
    },
  });
});
