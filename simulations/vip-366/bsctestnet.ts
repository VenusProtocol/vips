import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";

import vip365 from "../../vips/vip-365/bsctestnet";
import vip366 from "../../vips/vip-366/bsctestnet";
import OMNICHAIN_PROPOSAL_SENDER_ABI from "./abi/OmnichainProposalSender.json";

const { bsctestnet } = NETWORK_ADDRESSES;

forking(43839242, async () => {
  before(async () => {
    await pretendExecutingVip(await vip365(), bsctestnet.NORMAL_TIMELOCK);
  });

  testVip("vip329 give permissions to  critical & fasttrack timelock", await vip366(), {
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
