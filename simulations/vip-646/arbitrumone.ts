import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ARBITRUM_LIQUID_STAKED_ETH } from "../../vips/vip-634/phase4Markets";
import vip646 from "../../vips/vip-646/bscmainnet";
import { checkStep2PostVip, checkStep2PreVip } from "../vip-645/utils/checkStep2";

const FORK_BLOCK = 474085204;

forking(FORK_BLOCK, async () => {
  checkStep2PreVip([ARBITRUM_LIQUID_STAKED_ETH]);

  testForkedNetworkVipCommands("VIP-646 Arbitrum", await vip646());

  checkStep2PostVip([ARBITRUM_LIQUID_STAKED_ETH]);
});
