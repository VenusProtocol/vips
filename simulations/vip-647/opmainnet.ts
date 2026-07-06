import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { OPTIMISM } from "../../vips/vip-634/phase4Markets";
import vip647 from "../../vips/vip-647/bscmainnet";
import { checkDeprecationPostVip, checkDeprecationPreVip } from "./utils/checkDeprecation";

const FORK_BLOCK = 153006241;

forking(FORK_BLOCK, async () => {
  checkDeprecationPreVip([OPTIMISM]);

  testForkedNetworkVipCommands("VIP-647 Optimism", await vip647());

  checkDeprecationPostVip([OPTIMISM]);
});
