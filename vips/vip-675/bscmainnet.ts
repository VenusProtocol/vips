import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  CLOSE_FACTOR,
  COLLATERAL_GATEWAY,
  COLLATERAL_MARKETS_MAINSTREAM,
  INDEX_POOL_DESCRIPTION,
  LIQUIDITY_MARKETS_MAINSTREAM,
  MAINSTREAM_COMPTROLLER,
  MAINSTREAM_POOL_DESCRIPTION,
  MAINSTREAM_POOL_NAME,
  MIN_LIQUIDATABLE_COLLATERAL,
  POOL_LIQUIDATION_INCENTIVE,
  SEED_RECEIVER,
} from "./addresses/bscmainnet";
import {
  Vip675Part,
  buildCommands,
  commonParameters,
  contractLines,
  marketLines,
  noteLines,
  pct,
  pricingLines,
  referenceLines,
  tokens,
} from "./commands";

// ===================================================================================================
// VIP-675 [BNB Chain]: the bStock mainstream Hub-Funded Spoke pool, part 1 of 3.
//
// Stands up the pool, lists USDT, USDC and U and connects them to their Hubs, and lists the tier 1 bStocks. Part 2
// (./bscmainnet-part-2.ts) lists tiers 2 and 3, part 3 (./bscmainnet-part-3.ts) tier 4, into the same pool. Both need
// this one executed first; they do not depend on each other.
//
// WHY THREE PARTS: execute() runs every call in one transaction under the 16,777,216 per-tx gas cap, and each bStock
// adds about 1.1M to 1.4M to it. Two parts do not fit: the part that creates the pool fits at most 8 bStocks, and the
// other 12 revert in one part. The aggregator cuts the op count and the propose() calldata, not execute() gas. The
// split is by tier so each part reviews on its own.
//
// STATUS: DRAFT. `vip675()` throws while any address in ./addresses/bscmainnet.ts is still `PENDING`.
//
// AT EXECUTION, or the whole proposal reverts:
//  - Each new asset's Atlas feed is fresh (3800s). APRO feeds are fresh (3900s) and within 5% of Atlas.
//  - None of the new assets has a DBO config (`MarketAlreadyInitialized`).
//  - The VTreasury holds every seed. `withdrawTreasuryBEP20` caps at its balance and `addMarket` takes the rest from
//    the Normal Timelock, which holds no bStock.
// ===================================================================================================

/// The governor assigns the real number at proposal time.
const VIP_NUMBER = 675;

export const PART_1: Vip675Part = {
  vipNumber: VIP_NUMBER,
  comptroller: MAINSTREAM_COMPTROLLER,
  createsPool: true,
  liquidity: LIQUIDITY_MARKETS_MAINSTREAM,
  collateral: COLLATERAL_MARKETS_MAINSTREAM.filter(m => m.tier === 1),
};

export const vip675 = (part: Vip675Part = PART_1) => {
  const meta = {
    version: "v2",
    title: `VIP-${VIP_NUMBER} [BNB Chain] bStock mainstream Spoke pool: pool, liquidity and tier 1 bStocks (part 1 of 3)`,
    description: `#### Summary

If passed, this VIP will create the **${MAINSTREAM_POOL_NAME}** Hub-Funded Spoke pool on BNB Chain, next to the bStock index pool, and list its first markets:

- **Liquidity side**: USDT, USDC and U. Only the Liquidity Hub of the same token may supply each market, through the Spoke yield group that already funds the bStock index pool. They are borrowable and give no borrow power.
- **Collateral side**: ${
      part.collateral.length
    } single-stock bStocks. Anyone may supply them and use them as collateral. They are not borrowable.

VIP-${VIP_NUMBER + 1} (tier 2 and 3) and VIP-${VIP_NUMBER + 2} (tier 4) list the remaining bStocks into the same pool.

#### Proposed changes

1. Register the pool in the Spoke pool registry, with a ${pct(CLOSE_FACTOR)} close factor, a ${pct(
      POOL_LIQUIDATION_INCENTIVE.sub(parseUnits("1", 18)),
    )} pool-wide liquidation incentive and a $${tokens(
      MIN_LIQUIDATABLE_COLLATERAL,
    )} minimum liquidatable collateral, priced by the ResilientOracle and the DeviationBoundedOracle.
2. Set the pool descriptions shown in the Venus app: "${MAINSTREAM_POOL_DESCRIPTION}" for this pool, and "${INDEX_POOL_DESCRIPTION}" for the bStock index pool, which has none yet.
3. Price the new assets with Atlas as the main oracle and a DeviationBoundedOracle window, with APRO as pivot where it has a feed. NVDAB, TSLAB, SPCXB and SKHYB keep the configs they already have for the Core pool.
4. List the markets, each seeded from the Venus Treasury with the seed vTokens sent to ${SEED_RECEIVER}.
5. Give each collateral market a liquidation incentive of its own, set its protocol seize share where it is not the default 5%, and pause borrowing on them.
6. Restrict supply on the USDT, USDC and U markets to each Hub's Spoke yield group, and add each market to its yield group, after the bStock index market to deposit and before it to withdraw.
7. Grant the pool's permissions: the registry's, the Normal Timelock's, the Critical and Pause Guardians', and \`enterMarketForAccount\` to the CollateralGateway (${COLLATERAL_GATEWAY}), against this comptroller only.

Most of steps 5 to 7 run through the AuxiliaryCommandsAggregator, which holds the AccessControlManager admin role only while its batches run.

#### Market parameters

${marketLines(part).join("\n")}

${commonParameters(part)}

#### Pricing

${pricingLines(part).join("\n")}

#### Notes

${noteLines(part).join("\n")}

#### Deployed contracts

${contractLines(part).join("\n")}

#### References

${referenceLines.join("\n")}`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(buildCommands(part), meta, ProposalType.REGULAR);
};

export default vip675;
