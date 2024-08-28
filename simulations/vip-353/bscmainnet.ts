import { forking, testVip } from "../../src/vip-framework";
import vip353 from "../../vips/vip-353/bscmainnet";

forking(41389072, async () => {
  testVip("VIP-353", await vip353(), {});
});
