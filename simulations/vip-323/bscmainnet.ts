import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import vip308 from "../../vips/vip-322/bscmainnet";
import vip309 from "../../vips/vip-323/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(39004811, async () => {
  before(async () => {
    await pretendExecutingVip(await vip308());
  });

  testVip("vip309 give permissions to  critical & fasttrack timelock", await vip309(), {
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
