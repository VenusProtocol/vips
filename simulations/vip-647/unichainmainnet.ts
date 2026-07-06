import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { UNICHAIN } from "../../vips/vip-634/phase4Markets";
import vip647 from "../../vips/vip-647/bscmainnet";
import { checkDeprecationPostVip, checkDeprecationPreVip } from "./utils/checkDeprecation";

const FORK_BLOCK = 50862900;

forking(FORK_BLOCK, async () => {
  checkDeprecationPreVip([UNICHAIN]);

  testForkedNetworkVipCommands("VIP-647 Unichain", await vip647());

  checkDeprecationPostVip([UNICHAIN]);
});
