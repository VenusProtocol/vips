import { forking, testVip } from "src/vip-framework";

import vip625 from "../../vips/vip-625/bscmainnet";

// Recent BSC mainnet block — the VIP performs a no-op view call so any
// post-deployment block is fine.
const BLOCK_NUMBER = 100313367;

forking(BLOCK_NUMBER, async () => {
  testVip("VIP-625 [SNAPSHOT] Venus Tokenomics Phase II — Prime Rewards Redesign", await vip625(), {});
});
