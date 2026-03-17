import { forking, testVip } from "src/vip-framework";

import vip608_2 from "../../vips/vip-608/bscmainnet-2";

const BLOCK_NUMBER = 87425358;

forking(BLOCK_NUMBER, async () => {
  testVip("VIP-608 Isolated Pool VToken Upgrade (cross-chain dispatch)", await vip608_2());
});
