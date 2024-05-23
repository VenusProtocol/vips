import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import vip308 from "../../vips/vip-308/bsctestnet";
import vip309 from "../../vips/vip-309/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(40584500, async () => {
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
