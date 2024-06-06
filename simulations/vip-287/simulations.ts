import { forking, testVip } from "../../src/vip-framework";
import vip287 from "../../vips/vip-287/bscmainnet";

forking(37678758, async () => {
  testVip("VIP-287", await vip287(), {});
});
