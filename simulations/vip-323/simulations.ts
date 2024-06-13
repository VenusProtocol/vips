import { forking, testVip } from "../../src/vip-framework";
import vip323 from "../../vips/vip-323/bscmainnet";

forking(39577919, () => {
  testVip("VIP-323", vip323(), {});
});
