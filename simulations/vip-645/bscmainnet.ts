import { forking, testVip } from "src/vip-framework";

import { BNB_BTC, BNB_CORE, BNB_DEFI, BNB_GAMEFI } from "../../vips/vip-634/phase4Markets";
import vip645 from "../../vips/vip-645/bscmainnet";
import { CORE_EMODE } from "../../vips/vip-645/deprecationStep2";
import { checkStep2PostVip, checkStep2PreVip } from "./utils/checkStep2";

const FORK_BLOCK = 104562598;

const BNB_POOLS = [BNB_CORE, BNB_BTC, BNB_DEFI, BNB_GAMEFI];

forking(FORK_BLOCK, async () => {
  checkStep2PreVip(BNB_POOLS, CORE_EMODE);

  testVip("VIP-645 Market Deprecation Phase 4 (Step 2, Part 1) — BNB Chain", await vip645());

  checkStep2PostVip(BNB_POOLS, CORE_EMODE);
});
