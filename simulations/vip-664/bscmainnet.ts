import { forking, testVip } from "src/vip-framework";

import vip664 from "../../vips/vip-664/bscmainnet";
import { BNB_BTC, BNB_CORE, BNB_DEFI, BNB_GAMEFI, BNB_MEME } from "../../vips/vip-664/phase4Markets";
import { checkPhase4PostVip, checkPhase4PreVip } from "./utils/checkPhase4";

// BSC mainnet block (after the BNB push-out IRMs were deployed).
const FORK_BLOCK = 104562598;

const BNB_POOLS = [BNB_CORE, BNB_BTC, BNB_DEFI, BNB_GAMEFI, BNB_MEME];

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip(BNB_POOLS);

  testVip("VIP-664 Market Deprecation Phase 4 (Part 1) — BNB Chain", await vip664());

  checkPhase4PostVip(BNB_POOLS);
});
