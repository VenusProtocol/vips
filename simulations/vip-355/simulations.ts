import { forking, testVip } from "src/vip-framework";

import vip355 from "../../vips/vip-355/bscmainnet";

forking(41186665, async () => {
  testVip("VIP-355", await vip355(), {});
});
