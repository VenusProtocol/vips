import { forking, testVip } from "src/vip-framework";

import vip350 from "../../vips/vip-350/bscmainnet";

forking(41186665, async () => {
  testVip("VIP-350", await vip350(), {});
});
