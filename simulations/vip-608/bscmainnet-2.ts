import { forking, testVip } from "src/vip-framework";

import vip608_2 from "../../vips/vip-608/bscmainnet-2";

const BLOCK_NUMBER = 87684581;

forking(BLOCK_NUMBER, async () => {
  testVip("VIP-608 Grant syncCash permissions (all networks)", await vip608_2());
});
