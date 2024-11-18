import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip395 from "../../vips/vip-395/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(45736960, async () => {
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
