import { forking, testVip } from "../../../src/vip-framework";
import { vip244 } from "../../../vips/vip-244/vip-244-testnet";


forking(37099393, () => {

  before(async () => {
  });

  testVip("VIP-244 Unlist Market", vip244(), {
    callbackAfterExecution: async txResponse => {
    },
  });
});
