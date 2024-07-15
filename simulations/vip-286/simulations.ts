import { forking, testVip } from "src/vip-framework";

import vip286 from "../../vips/vip-286/bscmainnet";

forking(37678758, async () => {
  testVip("VIP-286", await vip286(), {});
});
