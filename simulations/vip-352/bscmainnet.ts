import { forking, testVip } from "../../src/vip-framework";
import vip352 from "../../vips/vip-352/bscmainnet";

forking(38491593, async () => {
  testVip("VIP-352", await vip352(), {});
});
