import { forking, testVip } from "src/vip-framework";

import vip354 from "../../vips/vip-354/bscmainnet";

forking(41186665, async () => {
  testVip("VIP-354", await vip354(), {});
});
