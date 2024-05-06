import { forking, testVip } from "../../src/vip-framework";
import vip300 from "../../vips/vip-300/bscmainnet";

forking(38491593, () => {
  testVip("VIP-300", vip300(), {});
});
