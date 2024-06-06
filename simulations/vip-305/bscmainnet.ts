import { forking, testVip } from "../../src/vip-framework";
import vip305 from "../../vips/vip-305/bscmainnet";

forking(37907083, async () => {
  testVip("VIP-305", await vip305(), {});
});
