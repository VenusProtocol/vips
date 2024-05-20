import { forking, testVip } from "../../src/vip-framework";
import vip305 from "../../vips/vip-305/bscmainnet";

forking(37907083, () => {
  testVip("VIP-305", vip305(), {});
});
