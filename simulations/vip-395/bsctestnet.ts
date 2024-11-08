import { forking, testVip } from "src/vip-framework";

import vip395 from "../../vips/vip-395/bsctestnet";

forking(45439039, async () => {
  testVip("vip395 arbitrum sepolia Prime configuration", await vip395());
});
