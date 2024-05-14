import { forking, testVip } from "../../src/vip-framework";
import vip295 from "../../vips/vip-295/bscmainnet";

forking(37678758, async () => {
  testVip("VIP-295", await vip295(), {});
});
