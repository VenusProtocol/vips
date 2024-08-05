import { forking, testVip } from "src/vip-framework";

import vip347 from "../../vips/vip-347/bscmainnet";

forking(40783059, async () => {
  testVip("VIP-347", await vip347(), {});
});
