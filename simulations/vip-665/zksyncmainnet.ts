import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ZKSYNC_CORE } from "../../vips/vip-664/phase4Markets";
import vip665 from "../../vips/vip-665/bscmainnet";
import { checkPhase4PostVip, checkPhase4PreVip } from "../vip-664/utils/checkPhase4";

// zkSync Era mainnet block (after the zkSync push-out IRM was deployed).
const FORK_BLOCK = 70814289;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([ZKSYNC_CORE]);

  testForkedNetworkVipCommands("VIP-665 zkSync Era", await vip665());

  checkPhase4PostVip([ZKSYNC_CORE]);
});
