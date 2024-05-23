import { forking, testVip } from "../../src/vip-framework";
import vip308 from "../../vips/vip-308/bscmainnet";

forking(38972300, () => {
  testVip("VIP-308", vip308(), {});
});
