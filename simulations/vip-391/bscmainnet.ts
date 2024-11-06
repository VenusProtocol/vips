import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip391 from "../../vips/vip-391/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";
import TREASURY_ABI from "./abi/VtreasuryAbi.json";

forking(43428406, async () => {
  testVip("VIP 391 Multichain Governance - Permissions", await vip391(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [3, 0],
      );
      await expectEvents(txResponse, [TREASURY_ABI], ["WithdrawTreasuryBNB"], [1]);
    },
  });
});
