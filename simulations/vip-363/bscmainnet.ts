import { forking, testVip } from "src/vip-framework";

import vip363 from "../../vips/vip-363/bscmainnet";

forking(42104700, async () => {
  testVip("VIP-363", await vip363(), {});
});
