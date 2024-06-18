import { forking, testVip } from "../../src/vip-framework";
import vip322 from "../../vips/vip-322/bscmainnet";

forking(39095011, () => {
  testVip("VIP-322", vip322(), {});
});
