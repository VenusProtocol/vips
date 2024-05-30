import { forking, testVip } from "../../src/vip-framework";
import vip312 from "../../vips/vip-312/bscmainnet";

forking(39089813, () => {
  testVip("VIP-312", vip312(), {});
});
