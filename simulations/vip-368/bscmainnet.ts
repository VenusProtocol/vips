import { forking, testVip } from "src/vip-framework";

import vip368 from "../../vips/vip-368/bscmainnet";

forking(42418800, async () => {
  testVip("VIP-368", await vip368(), {});
});
