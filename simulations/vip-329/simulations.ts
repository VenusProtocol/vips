import { forking, testVip } from "../../src/vip-framework";
import vip329 from "../../vips/vip-329/bscmainnet";

forking(39095011, async () => {
  testVip("VIP-329", await vip329(), {});
});
