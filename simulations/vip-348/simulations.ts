import { forking, testVip } from "src/vip-framework";

import vip348 from "../../vips/vip-348/bscmainnet";

forking(40783059, async () => {
  testVip("VIP-348", await vip348(), {});
});
