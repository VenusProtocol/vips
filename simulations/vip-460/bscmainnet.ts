import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip455 from "../../vips/vip-455/bscmainnet";
import vip460 from "../../vips/vip-460/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46794180, async () => {
  testVip("Multichain governance", await vip455());
  testVip("Accept ownerships/admins", await vip460(), {
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
