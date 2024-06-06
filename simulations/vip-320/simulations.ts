import { forking, testVip } from "../../src/vip-framework";
import vip320 from "../../vips/vip-320/bscmainnet";

forking(39095011, async () => {
  testVip("VIP-320", await vip320(), {});
});
