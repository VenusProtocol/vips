import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import vip326 from "../../vips/vip-326/bsctestnet-addendum";
import vip327 from "../../vips/vip-327/bsctestnet-addendum";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(41185533, async () => {
  before(async () => {
    await pretendExecutingVip(await vip326());
  });

  testVip("vip327 give permissions to  critical & fasttrack timelock", await vip327(), {
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
