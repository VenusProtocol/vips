import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip391 from "../../vips/vip-391/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(44995536, async () => {
  testVip("VIP 391 Multichain Governance - Permissions", await vip391(), {
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
