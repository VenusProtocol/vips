import { forking, testVip } from "src/vip-framework";

import vip345 from "../../vips/vip-345/bscmainnet";

forking(40783059, async () => {
  testVip("VIP-345", await vip345(), {});
});
