import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip634 from "../../vips/vip-634/bscmainnet";
import { OPTIMISM } from "../../vips/vip-634/phase4Markets";
import { checkPhase4PostVip, checkPhase4PreVip } from "./utils/checkPhase4";

// Optimism mainnet block (after the Optimism push-out IRM was deployed).
const FORK_BLOCK = 153006241;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([OPTIMISM]);

  testForkedNetworkVipCommands("VIP-634 Optimism", await vip634());

  checkPhase4PostVip([OPTIMISM]);
});
