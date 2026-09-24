import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ZKSYNC_CORE } from "../../vips/vip-634/phase4Markets";
import vip642 from "../../vips/vip-642/bscmainnet";
import { checkDeprecationPostVip, checkDeprecationPreVip } from "./utils/checkDeprecation";

const FORK_BLOCK = 70814289;

forking(FORK_BLOCK, async () => {
  checkDeprecationPreVip([ZKSYNC_CORE]);

  testForkedNetworkVipCommands("VIP-642 zkSync Era", await vip642());

  checkDeprecationPostVip([ZKSYNC_CORE]);
});
