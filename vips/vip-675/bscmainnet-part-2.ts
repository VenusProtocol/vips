import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { COLLATERAL_MARKETS_MAINSTREAM, MAINSTREAM_COMPTROLLER } from "./addresses/bscmainnet";
import { Vip675Part, buildCommands, collateralPartMeta } from "./commands";

// ===================================================================================================
// VIP-676 [BNB Chain]: the bStock mainstream Hub-Funded Spoke pool, part 2 of 3.
//
// Lists the tier 2 and tier 3 bStocks into the pool part 1 (./bscmainnet.ts) creates, and needs part 1 executed first:
// `addMarket` reverts `PoolRegistry: Pool not registered` before it. See part 1 for why there are three, and for what
// has to hold at execution.
// ===================================================================================================

const POOL_VIP_NUMBER = 675;
const VIP_NUMBER = POOL_VIP_NUMBER + 1;

export const PART_2: Vip675Part = {
  vipNumber: VIP_NUMBER,
  comptroller: MAINSTREAM_COMPTROLLER,
  createsPool: false,
  liquidity: [],
  collateral: COLLATERAL_MARKETS_MAINSTREAM.filter(m => m.tier === 2 || m.tier === 3),
};

export const vip676 = (part: Vip675Part = PART_2) =>
  makeProposal(
    buildCommands(part),
    collateralPartMeta(
      part,
      POOL_VIP_NUMBER,
      `VIP-${VIP_NUMBER} [BNB Chain] bStock mainstream Spoke pool: tier 2 and 3 bStocks (part 2 of 3)`,
    ),
    ProposalType.REGULAR,
  );

export default vip676;
