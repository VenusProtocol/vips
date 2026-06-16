import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ARBITRUM_LIQUID_STAKED_ETH } from "../../vips/vip-664/phase4Markets";
import vip665 from "../../vips/vip-665/bscmainnet";
import { checkPhase4PostVip, checkPhase4PreVip } from "../vip-664/utils/checkPhase4";

// Arbitrum One block (after the Arbitrum push-out IRM was deployed).
const FORK_BLOCK = 474085204;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([ARBITRUM_LIQUID_STAKED_ETH]);

  testForkedNetworkVipCommands("VIP-665 Arbitrum", await vip665());

  checkPhase4PostVip([ARBITRUM_LIQUID_STAKED_ETH]);
});
