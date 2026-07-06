import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ZKSYNC_CORE } from "../../vips/vip-634/phase4Markets";
import vip646 from "../../vips/vip-646/bscmainnet";
import { checkStep2PostVip, checkStep2PreVip } from "../vip-645/utils/checkStep2";

const FORK_BLOCK = 70814289;

forking(FORK_BLOCK, async () => {
  checkStep2PreVip([ZKSYNC_CORE]);

  testForkedNetworkVipCommands("VIP-646 zkSync Era", await vip646());

  checkStep2PostVip([ZKSYNC_CORE]);
});
