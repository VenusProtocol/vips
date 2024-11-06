import { forking, testVip } from "src/vip-framework";

import vip390 from "../../vips/vip-390/bscmainnet";

forking(43517108, async () => {
  testVip("VIP-390", await vip390(), {});
});
