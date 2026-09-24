import { forking, testVip } from "src/vip-framework";

import {
  BNB_LIQUID_STAKED_BNB,
  BNB_LIQUID_STAKED_ETH,
  BNB_MEME,
  BNB_STABLECOINS,
  BNB_TRON,
} from "../../vips/vip-634/phase4Markets";
import vip635 from "../../vips/vip-635/bscmainnet";
import { checkPhase4PostVip, checkPhase4PreVip } from "../vip-634/utils/checkPhase4";

// BSC mainnet block (after the BNB push-out IRM was deployed).
const FORK_BLOCK = 104562598;

const BNB_POOLS = [BNB_MEME, BNB_LIQUID_STAKED_BNB, BNB_LIQUID_STAKED_ETH, BNB_STABLECOINS, BNB_TRON];

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip(BNB_POOLS);

  testVip("VIP-635 Market Deprecation Phase 4 (Part 2) — BNB Chain", await vip635());

  checkPhase4PostVip(BNB_POOLS);
});
