import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip664 from "../../vips/vip-664/bscmainnet";
import { OPBNB } from "../../vips/vip-664/phase4Markets";
import { checkPhase4PostVip, checkPhase4PreVip } from "./utils/checkPhase4";

// opBNB mainnet block (after the opBNB push-out IRM was deployed).
const FORK_BLOCK = 153977309;

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip([OPBNB]);

  testForkedNetworkVipCommands("VIP-664 opBNB", await vip664());

  checkPhase4PostVip([OPBNB]);
});
