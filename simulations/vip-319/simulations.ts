import { forking, testVip } from "../../src/vip-framework";
import vip319 from "../../vips/vip-319/bscmainnet";

forking(39095011, () => {
  testVip("VIP-319", vip319(), {});
});
