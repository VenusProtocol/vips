import { forking, testVip } from "../../src/vip-framework";
import vip295 from "../../vips/vip-295/bscmainnet";

forking(37678758, () => {
  testVip("VIP-295", vip295(), {});
});
