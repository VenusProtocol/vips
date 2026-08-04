import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

// PrimeLiquidityProvider (BSC mainnet)
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";

// Prime reward tokens distributed to suppliers (BSC mainnet)
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// ===========================================================================
// August 2026 Prime rewards allocation: $70,000 split 50/50 across the USDT
// and wBNB supply markets ($35,000 each).
//
//   speed (tokens/block, 18 decimals) = monthlyUsdPerMarket / tokenPriceUsd / BLOCKS_PER_MONTH
//
// Repo convention: 192000 blocks/day  ->  BLOCKS_PER_MONTH = 192000 * 30.
// USDT is a ~$1 stable (price treated as 1). wBNB is priced at the BNB/USD
// Chainlink read at proposal preparation (2026-08-04): latestAnswer 59119323000
// (8 decimals) -> $591.19323.
// Each speed stays below the on-chain max (1e18 for both tokens).
// ===========================================================================
const BLOCKS_PER_MONTH = 192000 * 30; // 5,760,000
const MONTHLY_USD_PER_MARKET = 35000;
const BNB_PRICE_USD = 591.19323;

const speedFromMonthlyUsd = (monthlyUsd: number, priceUsd: number) =>
  parseUnits((monthlyUsd / priceUsd / BLOCKS_PER_MONTH).toFixed(18), 18);

export const NEW_PRIME_SPEED_FOR_USDT = speedFromMonthlyUsd(MONTHLY_USD_PER_MARKET, 1);
export const NEW_PRIME_SPEED_FOR_WBNB = speedFromMonthlyUsd(MONTHLY_USD_PER_MARKET, BNB_PRICE_USD);

export const vip664 = () => {
  const meta = {
    version: "v2",
    title: "VIP-664 [BNB Chain] August 2026 Prime Rewards Allocation",
    description: `This proposal outlines the allocation of Prime Rewards on BNB Chain for August 2026, based on available funds. The allocation is retroactive, redistributing revenue generated through July 2026.

July 2026 was the first month under Tokenomics Phase II, which increased Prime's share of reserves revenue from 20% to 40% and added a 20% share of liquidation revenue, up from 0% previously. The new revenue split took effect on-chain on 2026-07-01. At $70K, the August payout is 2.2x the amount distributed in July.

## Allocation Strategy

In July 2026, Venus generated **$166.6K** in reserves revenue and **$31.8K** in liquidation revenue on BNB Chain. Under the Phase II split, **$73.0K** of this is allocated to Prime and will be distributed as rewards in August 2026.

**Proposed allocation strategy:**

- **Allocate $70K in Prime rewards** while maintaining a buffer for market price fluctuations and to avoid full depletion.
- Rewards will be split **50/50 between the USDT and wBNB markets**, with speeds adjusted to allocate **$35K to each market's suppliers**.
- This continues the same strategy as June and July — rewarding the **USDT and wBNB supply markets**.
- Focusing rewards on the supply side helps strengthen liquidity and create conditions for lower borrow rates. In contrast, rewarding both sides tends to create arbitrage opportunities, artificially inflating activity and driving up borrow rates for other users.

This allocation is an estimate based on token prices at the time the reserves were collected. Actual allocations may vary due to price changes between collection and conversion into Prime reward tokens.

## Analysis

All the data presented below can be found in the [Venus Prime dashboard](https://dune.com/xvslove_team/venus-prime).

### Prime markets — Activity, reserves and rewards

**USDT Market**

- Overall USDT supply eased from **$191.5M to $178.6M (-6.7%)**, with borrowing down from **$117.3M to $112.0M (-4.6%)**.
- Prime user supply declined from **$38.2M to $36.1M (-5.4%)** — a further moderation from last month's -14.9% and the -32% before it, and this month the first time Prime supply held up better than the market as a whole (-5.4% vs -6.7%). The Prime supplier count was unchanged at **246**. USDT remains the largest Prime market by participation.
- USDT reserve revenue rose from **$37.2K to $39.9K (+7.3%)** MoM despite the smaller supply base, reflecting higher utilisation. It remains the dominant revenue contributor, justifying half of Prime rewards.

**wBNB Market**

- wBNB deposits continued to grow in token terms — end-of-month supply rose from **~102.8K to ~105.3K WBNB (+2.5%)**. The higher USD figure (**$56.4M → $62.0M**) mostly reflects the recovery in the BNB price over the period rather than new deposits.
- Prime participation continued to build: Prime suppliers grew from **47 to 63** and Prime-held supply from **~$4.0M to ~$5.8M (+44.7%)**. Prime-held wBNB supply has now grown roughly 6x in two months from a near-zero base.
- wBNB reserve revenue remains minimal (**~$1.3K in July**), consistent with a market still early in its growth. The ~$35K/mo reward is a deliberate supply incentive, to be tapered as the Prime supplier base deepens.

The Normal Timelock already holds the setTokensDistributionSpeed ACM permission, so no grants are needed. (The Critical Timelock's privileges were removed in VIP-645, so — unlike prior monthly allocations — this proposal is submitted as a Normal VIP.)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: PRIME_LIQUIDITY_PROVIDER,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [USDT, WBNB],
          [NEW_PRIME_SPEED_FOR_USDT, NEW_PRIME_SPEED_FOR_WBNB],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip664;
