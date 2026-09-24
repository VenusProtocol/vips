import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip634 from "../../vips/vip-634/bscmainnet";
import { ETH_CORE } from "../../vips/vip-634/phase4Markets";
import { checkPhase4PostVip, checkPhase4PreVip } from "./utils/checkPhase4";

// Ethereum mainnet block (after the Ethereum push-out IRM was deployed).
const FORK_BLOCK = 25329944;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([ETH_CORE]);

  testForkedNetworkVipCommands("VIP-634 Ethereum Core", await vip634());

  checkPhase4PostVip([ETH_CORE]);
});
