import { forking, testVip } from "src/vip-framework";

import vip634 from "../../vips/vip-634/bscmainnet";
import { BNB_BTC, BNB_CORE, BNB_DEFI, BNB_GAMEFI } from "../../vips/vip-634/phase4Markets";
import { checkPhase4PostVip, checkPhase4PreVip } from "./utils/checkPhase4";

// BSC mainnet block (after the BNB push-out IRMs were deployed).
const FORK_BLOCK = 104562598;

const BNB_POOLS = [BNB_CORE, BNB_BTC, BNB_DEFI, BNB_GAMEFI];

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip(BNB_POOLS);

  testVip("VIP-634 Market Deprecation Phase 4 (Part 1) — BNB Chain", await vip634());

  checkPhase4PostVip(BNB_POOLS);
});
