import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip427 from "../../vips/vip-427/bsctestnetPartA";
import vip430 from "../../vips/vip-427/bsctestnetPartB";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(47543999, async () => {
  testVip("VIP-427 testnet", await vip427(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [2, 0],
      );
    },
  });

  testVip("VIP-430 testnet", await vip430(), {
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
