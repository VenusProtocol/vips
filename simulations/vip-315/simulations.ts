import { forking, testVip } from "../../src/vip-framework";
import vip315 from "../../vips/vip-315/bscmainnet";

forking(39095011, () => {
  testVip("VIP-315", vip315(), {});
});
