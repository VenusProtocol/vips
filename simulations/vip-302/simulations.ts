import { forking, testVip } from "src/vip-framework";

import vip302 from "../../vips/vip-302/bscmainnet";

forking(38491593, async () => {
  testVip("VIP-302", await vip302(), {});
});
