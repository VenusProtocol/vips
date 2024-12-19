import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip408 from "../../vips/vip-408/bscmainnet";
import vip502 from "../../vips/vip-502/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "../vip-502/abi/OmnichainProposalSender.json";

forking(44978531, async () => {
  testVip("VIP-408 Multichain Governance", await vip408(), {});

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
