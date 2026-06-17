import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { BASE_CORE } from "../../vips/vip-634/phase4Markets";
import vip635 from "../../vips/vip-635/bscmainnet";
import { checkPhase4PostVip, checkPhase4PreVip } from "../vip-634/utils/checkPhase4";

// Base mainnet block (after the Base push-out IRM was deployed).
const FORK_BLOCK = 47410957;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([BASE_CORE]);

  testForkedNetworkVipCommands("VIP-635 Base", await vip635());

  checkPhase4PostVip([BASE_CORE]);
});
