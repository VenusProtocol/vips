import { forking, testVip } from "../../../src/vip-framework";
import { vip130Testnet } from "../../../vips/vip-130/testnet";

forking(30855643, () => {
  testVip("VIP-130-testnet Swap routers accept ownership", vip130Testnet());
});
