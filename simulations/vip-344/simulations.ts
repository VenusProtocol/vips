import { forking, testVip } from "../../src/vip-framework";
import vip344 from "../../vips/vip-344/bscmainnet";

forking(40785263, async () => {
  testVip("VIP-344", await vip344(), {});
});
