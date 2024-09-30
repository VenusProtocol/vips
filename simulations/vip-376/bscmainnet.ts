import { forking, testVip } from "src/vip-framework";

import vip376 from "../../vips/vip-376/bscmainnet";

forking(42626348, async () => {
  testVip("VIP-376", await vip376(), {});
});
