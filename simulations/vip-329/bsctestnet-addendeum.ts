import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import vip328 from "../../vips/vip-328/bsctestnet-addendum";
import vip329 from "../../vips/vip-329/bsctestnet-addendum";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(41185533, async () => {
  before(async () => {
    await pretendExecutingVip(await vip328(), bsctestnet.NORMAL_TIMELOCK);
  });

  testVip("vip329 give permissions to  critical & fasttrack timelock", await vip329(), {
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
