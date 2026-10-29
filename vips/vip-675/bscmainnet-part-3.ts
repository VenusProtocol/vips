import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { COLLATERAL_MARKETS_MAINSTREAM, MAINSTREAM_COMPTROLLER } from "./addresses/bscmainnet";
import { Vip675Part, buildCommands, collateralPartMeta } from "./commands";

// ===================================================================================================
// VIP-677 [BNB Chain]: the bStock mainstream Hub-Funded Spoke pool, part 3 of 3.
//
// Lists the tier 4 bStocks into the pool part 1 (./bscmainnet.ts) creates, and needs part 1 executed first. It does not
// depend on part 2. See part 1 for why there are three, and for what has to hold at execution.
// ===================================================================================================

const POOL_VIP_NUMBER = 675;
const VIP_NUMBER = POOL_VIP_NUMBER + 2;

export const PART_3: Vip675Part = {
  vipNumber: VIP_NUMBER,
  comptroller: MAINSTREAM_COMPTROLLER,
  createsPool: false,
  liquidity: [],
  collateral: COLLATERAL_MARKETS_MAINSTREAM.filter(m => m.tier === 4),
};

export const vip677 = (part: Vip675Part = PART_3) =>
  makeProposal(
    buildCommands(part),
    collateralPartMeta(
      part,
      POOL_VIP_NUMBER,
      `VIP-${VIP_NUMBER} [BNB Chain] bStock mainstream Spoke pool: tier 4 bStocks (part 3 of 3)`,
    ),
    ProposalType.REGULAR,
  );

export default vip677;
