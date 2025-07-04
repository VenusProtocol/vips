import { forking, testVip } from "src/vip-framework";

import vip599 from "../../vips/vip-xxx/bscmainnet";

forking(52815412, async () => {
  testVip("vip-599", await vip599(), {});
});
