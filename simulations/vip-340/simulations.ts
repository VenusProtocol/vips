import { forking, testVip } from "src/vip-framework";

import vip340 from "../../vips/vip-340/bscmainnet";

forking(40531419, async () => {
  testVip("VIP-340", await vip340(), {});
});
