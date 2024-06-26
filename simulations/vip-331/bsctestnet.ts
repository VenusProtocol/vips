import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import vip328 from "../../vips/vip-330/bsctestnet";
import vip331 from "../../vips/vip-331/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(40980904, async () => {
  before(async () => {
    await pretendExecutingVip(await vip328(), bsctestnet.NORMAL_TIMELOCK);
  });

  testVip("vip329 give permissions to  critical & fasttrack timelock", await vip331(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [OMNICHAIN_PROPOSAL_SENDER_ABI],
        ["ExecuteRemoteProposal", "StorePayload"],
        [2, 0],
      );
    },
  });
});
