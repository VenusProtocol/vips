import { forking, testVip } from "src/vip-framework";

import {
  BNB_LIQUID_STAKED_BNB,
  BNB_LIQUID_STAKED_ETH,
  BNB_STABLECOINS,
  BNB_TRON,
} from "../../vips/vip-664/phase4Markets";
import vip665 from "../../vips/vip-665/bscmainnet";
import { checkPhase4PostVip, checkPhase4PreVip } from "../vip-664/utils/checkPhase4";

// BSC mainnet block (after the BNB push-out IRM was deployed).
const FORK_BLOCK = 104562598;

const BNB_POOLS = [BNB_LIQUID_STAKED_BNB, BNB_LIQUID_STAKED_ETH, BNB_STABLECOINS, BNB_TRON];

forking(FORK_BLOCK, async () => {
  checkPhase4PreVip(BNB_POOLS);

  testVip("VIP-665 Market Deprecation Phase 4 (Part 2) — BNB Chain", await vip665());

  checkPhase4PostVip(BNB_POOLS);
});
