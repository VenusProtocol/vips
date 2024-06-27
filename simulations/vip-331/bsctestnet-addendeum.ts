import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import vip330 from "../../vips/vip-330/bsctestnet-addendum";
import vip331 from "../../vips/vip-331/bsctestnet-addendum";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(41185533, async () => {
  before(async () => {
    await pretendExecutingVip(await vip330(), bsctestnet.NORMAL_TIMELOCK);
  });

  testVip("vip331 give permissions to  critical & fasttrack timelock", await vip331(), {
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
