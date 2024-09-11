import { forking, testVip } from "src/vip-framework";

import vip364 from "../../vips/vip-364/bscmainnet";

forking(42104700, async () => {
  testVip("VIP-363", await vip364(), {});
});
