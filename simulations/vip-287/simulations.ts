import { forking, testVip } from "../../src/vip-framework";
import vip287 from "../../vips/vip-287/bscmainnet";

forking(37678758, () => {
  testVip("VIP-287", vip287(), {});
});
