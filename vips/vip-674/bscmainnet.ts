import { formatUnits, parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import {
  BLUECHIPS_COMPTROLLER,
  BLUECHIPS_POOL_NAME,
  CLOSE_FACTOR,
  COLLATERAL_GATEWAY,
  COLLATERAL_MARKETS_BLUECHIPS,
  LIQUIDITY_MARKETS_BLUECHIPS,
  MIN_LIQUIDATABLE_COLLATERAL,
  POOL_LIQUIDATION_INCENTIVE,
  SEED_RECEIVER,
} from "./addresses/bscmainnet";
import {
  Vip674Part,
  buildCommands,
  commonParameters,
  contractLines,
  marketLines,
  noteLines,
  pct,
  pricingLines,
  referenceLines,
} from "./commands";

// ===================================================================================================
// VIP-674 [BNB Chain]: the Bluechips Hub-Funded Spoke pool, part 1 of 3.
//
// Stands up the pool, lists USDT, USDC and U and connects them to their Hubs, and lists the tier 1 bStocks. Part 2
// (./bscmainnet-part-2.ts) lists tiers 2 and 3, part 3 (./bscmainnet-part-3.ts) tier 4, into the same pool. Both need
// this one executed first; they do not depend on each other.
//
// WHY THREE PARTS: execute() runs every call in one transaction under the 16,777,216 per-tx gas cap, and each new
// bStock adds about 1.1M to it (listing, pricing and its batched setters). The three parts execute in about 30.3M
// together, and tiers 2 to 4 in one part would take about 17.2M. Two parts do not fit either: the part that creates the
// pool fits at most 8 bStocks before its execute() reverts, and the 13 left over already need more than the cap. The
// aggregator only takes the op count and the propose() calldata down; the seed withdrawal, `approve` and `addMarket`
// stay inline. The split is by tier so each part reviews on its own.
//
// GAS, from the simulation (bscmainnet fork at block 130,088,000, the propose() figure through the proposer Safe):
//  - part 1: propose() 11.39M (68%), queue() 3.03M, execute() 12.47M (74%)
//  - part 2: propose() 9.62M (57%), queue() 2.31M, execute() 10.22M (61%)
//  - part 3: propose() 7.40M (44%), queue() 1.83M, execute() 7.62M (45%)
//
// STATUS: DRAFT. `vip674()` throws while any address in ./addresses/bscmainnet.ts is still `PENDING`.
//
// AT EXECUTION, or the whole proposal reverts:
//  - Atlas authorizes ATLAS_ORACLE on each new asset's feed, and each feed is fresh (3800s). APRO feeds are fresh
//    (3900s) and within 5% of Atlas.
//  - None of the new assets has a DBO config (`MarketAlreadyInitialized`).
//  - The VTreasury holds every seed. `withdrawTreasuryBEP20` caps at its balance and `addMarket` takes the rest from
//    the Normal Timelock, which holds no bStock.
// ===================================================================================================

/// Placeholder, as in VIP-668 to VIP-670. VIP numbers are assigned by the governor at proposal time.
const VIP_NUMBER = 674;

export const PART_1: Vip674Part = {
  vipNumber: VIP_NUMBER,
  comptroller: BLUECHIPS_COMPTROLLER,
  createsPool: true,
  liquidity: LIQUIDITY_MARKETS_BLUECHIPS,
  collateral: COLLATERAL_MARKETS_BLUECHIPS.filter(m => m.tier === 1),
};

export const vip674 = (part: Vip674Part = PART_1) => {
  const meta = {
    version: "v2",
    title: `VIP-${VIP_NUMBER} [BNB Chain] Bluechips Spoke pool: pool, liquidity and tier 1 bStocks (part 1 of 3)`,
    description: `#### Summary

If passed, this VIP will create the **${BLUECHIPS_POOL_NAME}** Hub-Funded Spoke pool on BNB Chain, next to the bStock index pool, and list its first markets:

- **Liquidity side**: USDT, USDC and U. Only the Liquidity Hub of the same token may supply each market, through the Spoke yield group that already funds the bStock index pool. They are borrowable and give no borrow power.
- **Collateral side**: ${
      part.collateral.length
    } single-stock bStocks. Anyone may supply them and use them as collateral. They are not borrowable.

VIP-${VIP_NUMBER + 1} (tier 2 and 3) and VIP-${VIP_NUMBER + 2} (tier 4) list the remaining bStocks into the same pool.

#### Proposed changes

1. Register the pool in the Spoke pool registry, with a ${pct(CLOSE_FACTOR)} close factor, a ${pct(
      POOL_LIQUIDATION_INCENTIVE.sub(parseUnits("1", 18)),
    )} pool-wide liquidation incentive and a $${formatUnits(
      MIN_LIQUIDATABLE_COLLATERAL,
      18,
    )} minimum liquidatable collateral, priced by the ResilientOracle and the DeviationBoundedOracle.
2. Price the new assets with Atlas as the main oracle and a DeviationBoundedOracle window, with APRO as pivot where it has a feed. NVDAB, TSLAB, SPCXB and SKHYB keep the configs they already have for the Core pool.
3. List the markets, each seeded from the Venus Treasury with the seed vTokens sent to ${SEED_RECEIVER}.
4. Give each collateral market a liquidation incentive of its own, and pause borrowing on them.
5. Restrict supply on the USDT, USDC and U markets to each Hub's Spoke yield group, and add each market to its yield group, after the bStock index market to deposit and before it to withdraw.
6. Grant the pool's permissions: the registry's, the Normal Timelock's, the Critical and Pause Guardians', and \`enterMarketForAccount\` to the CollateralGateway (${COLLATERAL_GATEWAY}), against this comptroller only.

Most of steps 4 to 6 run through the AuxiliaryCommandsAggregator, which holds the AccessControlManager admin role only while its batches run.

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

export default vip674;
