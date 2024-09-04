import { forking, testVip } from "src/vip-framework";

import vip360 from "../../vips/vip-360/bscmainnet";

forking(41683416, async () => {
  testVip("VIP-360", await vip360(), {});
});
