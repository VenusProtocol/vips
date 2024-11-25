import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip395 from "../../vips/vip-400/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(44324800, async () => {
  testVip("vip395 arbitrum sepolia Prime configuration", await vip395(), {
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
