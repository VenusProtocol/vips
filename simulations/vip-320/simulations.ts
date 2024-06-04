import { forking, testVip } from "../../src/vip-framework";
import vip320 from "../../vips/vip-320/bscmainnet";

forking(39095011, () => {
  testVip("VIP-320", vip320(), {});
});
