import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import vip326 from "../../vips/vip-326/bscmainnet";
import vip327 from "../../vips/vip-327/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(39719981, async () => {
  before(async () => {
    await pretendExecutingVip(await vip326());
  });

  testVip("vip327 give permissions to  critical & fasttrack timelock", await vip327(), {
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
