import { forking, testVip } from "src/vip-framework";

import vip608_3 from "../../vips/vip-608/bscmainnet-3";

const BLOCK_NUMBER = 87684581;

forking(BLOCK_NUMBER, async () => {
  testVip("VIP-608 Upgrade VToken beacon and syncCash (all networks)", await vip608_3());
});
