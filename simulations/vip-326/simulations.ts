import { forking, testVip } from "../../src/vip-framework";
import vip326 from "../../vips/vip-326/bscmainnet";

forking(39750431, () => {
  testVip("VIP-326", vip326(), {});
});
