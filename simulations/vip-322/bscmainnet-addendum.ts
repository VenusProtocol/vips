import { forking, testVip } from "../../src/vip-framework";
import vip322 from "../../vips/vip-322/bscmainnet-addendum";

forking(39569700, () => {
  testVip("VIP-322", vip322(), {});
});
