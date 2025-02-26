import { forking, testVip } from "src/vip-framework";

import vip457 from "../../vips/vip-457/bscmainnet";

forking(46799555, async () => {
  testVip("VIP-457", await vip457(), {});
});
