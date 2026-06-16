import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ETH_CURVE, ETH_LIQUID_STAKED_ETH } from "../../vips/vip-664/phase4Markets";
import vip665 from "../../vips/vip-665/bscmainnet";
import { checkPhase4PostVip, checkPhase4PreVip } from "../vip-664/utils/checkPhase4";

// Ethereum mainnet block (after the Ethereum push-out IRM was deployed).
const FORK_BLOCK = 25329944;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([ETH_CURVE, ETH_LIQUID_STAKED_ETH]);

  testForkedNetworkVipCommands("VIP-665 Ethereum Curve + Liquid Staked ETH", await vip665());

  checkPhase4PostVip([ETH_CURVE, ETH_LIQUID_STAKED_ETH]);
});
