import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { UNICHAIN } from "../../vips/vip-634/phase4Markets";
import vip645 from "../../vips/vip-645/bscmainnet";
import { checkStep2PostVip, checkStep2PreVip } from "./utils/checkStep2";

const FORK_BLOCK = 50862900;

forking(FORK_BLOCK, async () => {
  checkStep2PreVip([UNICHAIN]);

  testForkedNetworkVipCommands("VIP-645 Unichain", await vip645());

  checkStep2PostVip([UNICHAIN]);
});
