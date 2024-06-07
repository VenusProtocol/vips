import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import vip322 from "../../vips/vip-322/bscmainnet";
import vip323 from "../../vips/vip-323/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(39400639, async () => {
  before(async () => {
    await pretendExecutingVip(await vip322());
  });

  testVip("vip323 give permissions to  critical & fasttrack timelock", await vip323(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [2, 0],
      );
    },
  });
});
