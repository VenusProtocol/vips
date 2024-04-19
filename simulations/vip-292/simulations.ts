import { forking, testVip } from "../../src/vip-framework";
import vip292 from "../../vips/vip-292/bscmainnet";

forking(37997157, () => {
  testVip("VIP-292", vip292(), {});
});
