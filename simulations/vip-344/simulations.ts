import { forking, testVip } from "src/vip-framework";

import vip344 from "../../vips/vip-344/bscmainnet";

forking(40783059, async () => {
  testVip("VIP-344", await vip344(), {});
});
