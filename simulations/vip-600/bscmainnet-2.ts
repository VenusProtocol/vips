import { forking, testVip } from "src/vip-framework";

import vip601 from "../../vips/vip-600/bscmainnet-2";

const BLOCK_NUMBER = 87684581;

forking(BLOCK_NUMBER, async () => {
  testVip("VIP-601 Grant syncCash permissions (all networks)", await vip601());
});
