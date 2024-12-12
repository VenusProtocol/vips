import { forking, testVip } from "src/vip-framework";

import vip386 from "../../vips/vip-386/bscmainnet";

forking(43314681, async () => {
  testVip("VIP-386", await vip386(), {});
});
