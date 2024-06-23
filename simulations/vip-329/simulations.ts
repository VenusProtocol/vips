import { forking, testVip } from "../../src/vip-framework";
import vip329 from "../../vips/vip-329/bscmainnet";

forking(39095011, () => {
  testVip("VIP-329", vip329(), {});
});
