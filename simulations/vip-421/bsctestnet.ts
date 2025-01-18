import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip421 from "../../vips/vip-411/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47409760, async () => {
  testVip("VIP-421 testnet", await vip421(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });
});
