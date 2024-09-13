import { forking, testVip } from "src/vip-framework";

import vip356 from "../../vips/vip-356/bscmainnet";

forking(41683416, async () => {
  testVip("VIP-356", await vip356(), {});
});
