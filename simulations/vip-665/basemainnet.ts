import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { BASE_CORE } from "../../vips/vip-664/phase4Markets";
import vip665 from "../../vips/vip-665/bscmainnet";
import { checkPhase4PostVip, checkPhase4PreVip } from "../vip-664/utils/checkPhase4";

// Base mainnet block (after the Base push-out IRM was deployed).
const FORK_BLOCK = 47410957;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([BASE_CORE]);

  testForkedNetworkVipCommands("VIP-665 Base", await vip665());

  checkPhase4PostVip([BASE_CORE]);
});
