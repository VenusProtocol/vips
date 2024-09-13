import { forking, testVip } from "../../src/vip-framework";
import vip351 from "../../vips/vip-351/bscmainnet";

forking(41323410, async () => {
  testVip("VIP-351", await vip351(), {});
});
