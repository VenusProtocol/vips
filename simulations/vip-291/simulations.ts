import { forking, testVip } from "../../src/vip-framework";
import vip291 from "../../vips/vip-291/bscmainnet";

forking(38071914, () => {
  testVip("VIP-291", vip291(), {});
});
