import { forking, testVip } from "../../src/vip-framework";
import vip304 from "../../vips/vip-304/bscmainnet";

forking(38491593, () => {
  testVip("VIP-304", vip304(), {});
});
