import { forking, testVip } from "../../src/vip-framework";
import vip285 from "../../vips/vip-285/bscmainnet";

forking(37675391, () => {
  testVip("VIP-285", vip285(), {});
});
