import { forking, testVip } from "../../src/vip-framework";
import vip324 from "../../vips/vip-324/bscmainnet";

forking(39577919, () => {
  testVip("VIP-324", vip324(), {});
});
