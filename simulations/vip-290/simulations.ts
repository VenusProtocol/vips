import { forking, testVip } from "src/vip-framework";

import vip290 from "../../vips/vip-290/bscmainnet";

forking(37907083, async () => {
  testVip("VIP-290", await vip290(), {});
});
