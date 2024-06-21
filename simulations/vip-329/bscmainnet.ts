import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import vip328 from "../../vips/vip-328/bscmainnet";
import vip329 from "../../vips/vip-329/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(39719981, async () => {
  before(async () => {
    await pretendExecutingVip(await vip328());
  });

  testVip("vip329 give permissions to  critical & fasttrack timelock", await vip329(), {
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
