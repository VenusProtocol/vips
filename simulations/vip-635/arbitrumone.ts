import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { ARBITRUM_LIQUID_STAKED_ETH } from "../../vips/vip-634/phase4Markets";
import vip635 from "../../vips/vip-635/bscmainnet";
import { checkPhase4PostVip, checkPhase4PreVip } from "../vip-634/utils/checkPhase4";

// Arbitrum One block (after the Arbitrum push-out IRM was deployed).
const FORK_BLOCK = 474085204;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([ARBITRUM_LIQUID_STAKED_ETH]);

  testForkedNetworkVipCommands("VIP-635 Arbitrum", await vip635());

  checkPhase4PostVip([ARBITRUM_LIQUID_STAKED_ETH]);
});
