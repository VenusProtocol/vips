import { forking, testVip } from "../../src/vip-framework";
import vip295 from "../../vips/vip-295/bscmainnet";

forking(37907083, () => {
  testVip("VIP-295", vip295(), {});
});
