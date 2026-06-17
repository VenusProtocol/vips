import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ZKSYNC_CORE } from "../../vips/vip-634/phase4Markets";
import vip635 from "../../vips/vip-635/bscmainnet";
import { checkPhase4PostVip, checkPhase4PreVip } from "../vip-634/utils/checkPhase4";

// zkSync Era mainnet block (after the zkSync push-out IRM was deployed).
const FORK_BLOCK = 70814289;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([ZKSYNC_CORE]);

  testForkedNetworkVipCommands("VIP-635 zkSync Era", await vip635());

  checkPhase4PostVip([ZKSYNC_CORE]);
});
