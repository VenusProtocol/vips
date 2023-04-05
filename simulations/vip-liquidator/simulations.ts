import { forking, testVip } from "../../src/vip-framework";
import { vipLiquidator } from "../../vips/vip-liquidator";

forking(27083193, () => {
  testVip("VIP-Liquidator Liquidator Update", vipLiquidator());
});
