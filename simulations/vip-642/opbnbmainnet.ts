import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { OPBNB } from "../../vips/vip-634/phase4Markets";
import vip642 from "../../vips/vip-642/bscmainnet";
import { checkDeprecationPostVip, checkDeprecationPreVip } from "./utils/checkDeprecation";

const FORK_BLOCK = 153977309;

forking(FORK_BLOCK, async () => {
  checkDeprecationPreVip([OPBNB]);

  testForkedNetworkVipCommands("VIP-642 opBNB", await vip642());

  checkDeprecationPostVip([OPBNB]);
});
