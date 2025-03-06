import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip456 from "../../vips/vip-456/bscmainnet";
import vip460 from "../../vips/vip-460/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47225425, async () => {
  testVip("Multichain governance", await vip456());
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
