import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip664 from "../../vips/vip-664/bscmainnet";
import { UNICHAIN } from "../../vips/vip-664/phase4Markets";
import { checkPhase4PostVip, checkPhase4PreVip } from "./utils/checkPhase4";

// Unichain mainnet block (after the Unichain push-out IRM was deployed).
const FORK_BLOCK = 50862900;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([UNICHAIN]);

  testForkedNetworkVipCommands("VIP-664 Unichain", await vip664());

  checkPhase4PostVip([UNICHAIN]);
});
