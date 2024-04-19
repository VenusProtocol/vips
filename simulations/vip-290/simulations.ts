import { forking, testVip } from "../../src/vip-framework";
import vip290 from "../../vips/vip-290/bscmainnet";

forking(37907083, () => {
  testVip("VIP-290", vip290(), {});
});
