import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { OPBNB } from "../../vips/vip-634/phase4Markets";
import vip645 from "../../vips/vip-645/bscmainnet";
import { checkStep2PostVip, checkStep2PreVip } from "./utils/checkStep2";

const FORK_BLOCK = 153977309;

forking(FORK_BLOCK, async () => {
  checkStep2PreVip([OPBNB]);

  testForkedNetworkVipCommands("VIP-645 opBNB", await vip645());

  checkStep2PostVip([OPBNB]);
});
