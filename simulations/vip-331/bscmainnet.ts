import { NETWORK_ADDRESSES } from "../../src/networkAddresses";
import { expectEvents } from "../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import vip330 from "../../vips/vip-330/bscmainnet";
import vip331 from "../../vips/vip-331/bscmainnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { bscmainnet } = NETWORK_ADDRESSES;

forking(39719981, async () => {
  const proposal = await vip330();
  before(async () => {
    await pretendExecutingVip(proposal, bscmainnet.NORMAL_TIMELOCK);
  });

  testVip("vip331 give permissions to  critical & fasttrack timelock", await vip331(), {
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
