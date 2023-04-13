import { forking, testVip } from "../../src/vip-framework";
import { vip108Testnet } from "../../vips/vip-108-testnet";

forking(28839888, async () => {
  testVip("VIP-108-testnet Change Vault Implementation Testnet", vip108Testnet());
});
