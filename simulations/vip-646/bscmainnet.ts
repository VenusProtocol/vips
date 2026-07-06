import { forking, testVip } from "src/vip-framework";

import {
  BNB_LIQUID_STAKED_BNB,
  BNB_LIQUID_STAKED_ETH,
  BNB_MEME,
  BNB_STABLECOINS,
  BNB_TRON,
} from "../../vips/vip-634/phase4Markets";
import vip646 from "../../vips/vip-646/bscmainnet";
import { checkStep2PostVip, checkStep2PreVip } from "../vip-645/utils/checkStep2";

const FORK_BLOCK = 104562598;

const BNB_POOLS = [BNB_MEME, BNB_LIQUID_STAKED_BNB, BNB_LIQUID_STAKED_ETH, BNB_STABLECOINS, BNB_TRON];

forking(FORK_BLOCK, async () => {
  checkStep2PreVip(BNB_POOLS);

  testVip("VIP-646 Market Deprecation Phase 4 (Step 2, Part 2) — BNB Chain", await vip646());

  checkStep2PostVip(BNB_POOLS);
});
