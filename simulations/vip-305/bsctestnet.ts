import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { vip304 } from "../../vips/vip-304/bsctestnet";
import { vip305 } from "../../vips/vip-305/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(40149880, async () => {
  before(async () => {
    await pretendExecutingVip(await vip304());
  });

  testVip("vip305 give permissions to  critical & fasttrack timelock", await vip305(), {
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
