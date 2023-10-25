import { forking, testVip } from "../../../src/vip-framework";
import { vip192Testnet } from "../../../vips/vip-192/vip-192-tetsnet";


forking(34514247, () => {
  describe("Pre-VIP behavior", () => {
  });

  testVip("VIP-192 Prime Program", vip192Testnet(), {
  });

  describe("Post-VIP behavior", async () => {
  });
});
