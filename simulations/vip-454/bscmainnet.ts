import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip454Base from "../../vips/vip-454/bscmainnetBase";
import vip454Zksync from "../../vips/vip-454/bscmainnetZksync";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46847530, async () => {
  testVip("Add WstETH market to Zksync mainnet", await vip454Zksync(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [1, 0],
      );
    },
  });

  testVip("Add WstETH market to Base mainnet", await vip454Base(), {
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
