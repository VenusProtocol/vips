import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import vip323 from "../../vips/vip-323/bscmainnet";
import vip324 from "../../vips/vip-324/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(39603799, async () => {
  before(async () => {
    await pretendExecutingVip(await vip323());
  });

  testVip("vip324 give permissions to  critical & fasttrack timelock", await vip324(), {
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
