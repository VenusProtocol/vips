import { expectEvents } from "../../src/utils";
import { forking, testVip } from "../../src/vip-framework";
import vip384 from "../../vips/vip-384/bsctestnet";
import vip386 from "../../vips/vip-386/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

forking(46051809, async () => {
  testVip("VIP 384 Multichain Governance - Grant Permissions", await vip384(), {});

  testVip("vip386 XVS vault permission proposal", await vip386(), {
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
