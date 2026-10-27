import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { BLUECHIPS_COMPTROLLER, COLLATERAL_MARKETS_BLUECHIPS } from "./addresses/bscmainnet";
import { Vip674Part, buildCommands, collateralPartMeta } from "./commands";

// ===================================================================================================
// VIP-676 [BNB Chain]: the Bluechips Hub-Funded Spoke pool, part 3 of 3.
//
// Lists the tier 4 bStocks into the pool part 1 (./bscmainnet.ts) creates, and needs part 1 executed first. It does not
// depend on part 2. Its own on-chain proposal, so its own VIP number. See part 1 for why there are three, and for what
// has to hold at execution.
// ===================================================================================================

const POOL_VIP_NUMBER = 674;
const VIP_NUMBER = POOL_VIP_NUMBER + 2;

export const PART_3: Vip674Part = {
  vipNumber: VIP_NUMBER,
  comptroller: BLUECHIPS_COMPTROLLER,
  createsPool: false,
  liquidity: [],
  collateral: COLLATERAL_MARKETS_BLUECHIPS.filter(m => m.tier === 4),
};

export const vip676 = (part: Vip674Part = PART_3) =>
  makeProposal(
    buildCommands(part),
    collateralPartMeta(
      part,
      POOL_VIP_NUMBER,
      `VIP-${VIP_NUMBER} [BNB Chain] Bluechips Spoke pool: tier 4 bStocks (part 3 of 3)`,
    ),
    ProposalType.REGULAR,
  );

export default vip676;
