import { forking, testVip } from "src/vip-framework";

import vip382 from "../../vips/vip-382/bscmainnet";

forking(42626348, async () => {
  testVip("VIP-382", await vip382(), {});
});
