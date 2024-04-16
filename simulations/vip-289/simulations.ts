import { forking, testVip } from "../../src/vip-framework";
import vip289 from "../../vips/vip-289/bscmainnet";

forking(37907083, () => {
  testVip("VIP-289", vip289(), {});
});
