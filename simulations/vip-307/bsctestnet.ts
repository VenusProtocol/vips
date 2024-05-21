import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vip306 } from "../../vips/vip-306/bsctestnet";
import { vip307 } from "../../vips/vip-307/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(40149880, async () => {
  before(async () => {
    await pretendExecutingVip(await vip306());
  });

  testVip("vip307 give permissions to  critical & fasttrack timelock", await vip307(), {
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
