import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip502 from "../../vips/vip-502/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "../vip-502/abi/OmnichainProposalSender.json";

forking(45036507, async () => {
  testVip("VIP-502 Transfer ownership to Governance", await vip502(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [6, 0],
      );
    },
  });
});
