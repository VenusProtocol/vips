import { forking, testVip } from "src/vip-framework";

import vip365 from "../../vips/vip-365/bscmainnet";

forking(42104700, async () => {
  testVip("VIP-365", await vip365(), {});
});
