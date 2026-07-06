import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ETH_CURVE, ETH_LIQUID_STAKED_ETH } from "../../vips/vip-634/phase4Markets";
import vip646 from "../../vips/vip-646/bscmainnet";
import { checkStep2PostVip, checkStep2PreVip } from "../vip-645/utils/checkStep2";

const FORK_BLOCK = 25329944;

const ETH_POOLS = [ETH_CURVE, ETH_LIQUID_STAKED_ETH];

forking(FORK_BLOCK, async () => {
  checkStep2PreVip(ETH_POOLS);

  testForkedNetworkVipCommands("VIP-646 Ethereum", await vip646());

  checkStep2PostVip(ETH_POOLS);
});
