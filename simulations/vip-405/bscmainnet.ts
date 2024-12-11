import { forking, testVip } from "src/vip-framework";

import vip405 from "../../vips/vip-405/bscmainnet";

forking(44774477, async () => {
  testVip("VIP-405", await vip405(), {});
});
