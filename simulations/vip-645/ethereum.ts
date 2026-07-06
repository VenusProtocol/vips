import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip645 from "../../vips/vip-645/bscmainnet";
import { ETH_CORE_STEP2 } from "../../vips/vip-645/deprecationStep2";
import { checkStep2PostVip, checkStep2PreVip } from "./utils/checkStep2";

const FORK_BLOCK = 25329944;

forking(FORK_BLOCK, async () => {
  checkStep2PreVip([ETH_CORE_STEP2]);

  testForkedNetworkVipCommands("VIP-645 Ethereum Core", await vip645());

  checkStep2PostVip([ETH_CORE_STEP2]);
});
