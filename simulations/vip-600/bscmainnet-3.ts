import { forking, testVip } from "src/vip-framework";

import vip602 from "../../vips/vip-600/bscmainnet-3";

const BLOCK_NUMBER = 87684581;

forking(BLOCK_NUMBER, async () => {
  testVip("VIP-602 Upgrade VToken beacon and syncCash (all networks)", await vip602());
});
